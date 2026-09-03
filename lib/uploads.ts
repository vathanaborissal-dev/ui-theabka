import { api } from "@/lib/api-client"

/**
 * Photo uploads, via Cloudinary.
 *
 * The browser downscales once before sending — not to control what guests
 * download, but because uploading an untouched 8 MB photo over mobile data is
 * slow enough that people give up. Delivery sizing is Cloudinary's job: see
 * `imageSrcSet`, which asks for the width each device actually needs.
 *
 * This is the part that made Cloudinary worth a second vendor. Serving one
 * fixed size to every device means a phone downloads a desktop-sized image and
 * throws most of it away, and no amount of client-side compression fixes that,
 * because the client compressing has no idea what screen will open the
 * invitation.
 */

/** Upload ceiling on the long edge. Generous: Cloudinary resizes on the way out. */
const MAX_UPLOAD_EDGE = 2400
const QUALITY = 0.85

export type UploadProgress = {
  /** 0–1, or null while the browser has not reported anything yet. */
  ratio: number | null
  loaded: number
  total: number
}

export type CompressedImage = {
  blob: Blob
  contentType: string
  width: number
  height: number
  originalBytes: number
}

/** WebP where the browser can encode it, JPEG otherwise. */
function preferredType(): string {
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg"
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap honours EXIF orientation, which an <img> does not —
  // without it, portrait photos off a phone arrive lying on their side.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" })
    } catch {
      // Falls through to the <img> path.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error("That file could not be read as an image"))
      image.src = url
    })
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

export async function compressImage(
  file: File,
  { maxEdge = MAX_UPLOAD_EDGE }: { maxEdge?: number } = {}
): Promise<CompressedImage> {
  const source = await loadBitmap(file)
  const width = "width" in source ? source.width : 0
  const height = "height" in source ? source.height : 0
  if (!width || !height) throw new Error("That file could not be read as an image")

  const scale = Math.min(1, maxEdge / Math.max(width, height))
  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = targetWidth
  canvas.height = targetHeight
  const context = canvas.getContext("2d")
  if (!context) throw new Error("This browser cannot process images")
  context.drawImage(source as CanvasImageSource, 0, 0, targetWidth, targetHeight)
  if ("close" in source) source.close()

  const contentType = preferredType()
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, contentType, QUALITY)
  )
  if (!blob) throw new Error("This browser could not compress that image")

  return { blob, contentType, width: targetWidth, height: targetHeight, originalBytes: file.size }
}

export type SignedUpload = {
  uploadUrl: string
  fields: Record<string, string>
  maxBytes: number
}

export type CloudinaryResult = {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
}

/**
 * XHR rather than fetch: fetch still cannot report upload progress in any
 * browser, and a wedding photo on a mobile connection is exactly where a
 * progress bar earns its keep.
 */
function postForm(
  url: string,
  form: FormData,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("POST", url)

    request.upload.onprogress = (event) => {
      onProgress?.({
        ratio: event.lengthComputable ? event.loaded / event.total : null,
        loaded: event.loaded,
        total: event.total,
      })
    }
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        // Cloudinary explains refusals in the body; surface that rather than a
        // bare status, since "Invalid signature" is actionable and "400" is not.
        let detail = ""
        try {
          detail = JSON.parse(request.responseText)?.error?.message ?? ""
        } catch {
          // Body was not JSON; the status alone will have to do.
        }
        reject(new Error(detail || `Upload failed (${request.status})`))
        return
      }
      try {
        resolve(JSON.parse(request.responseText) as CloudinaryResult)
      } catch {
        reject(new Error("Upload succeeded but the response could not be read"))
      }
    }
    request.onerror = () => reject(new Error("Upload failed — check your connection"))
    request.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"))

    signal?.addEventListener("abort", () => request.abort(), { once: true })
    request.send(form)
  })
}

/**
 * Sends a blob using a one-shot signature returned by the API.
 *
 * Kept here so every photo flow gets the same mobile-safe transport and the
 * useful error Cloudinary returns. The disposable camera previously used a
 * bare `fetch`, which collapsed a storage refusal and a lost connection into
 * the same generic message.
 */
export function uploadSignedBlob(
  signed: SignedUpload,
  file: Blob,
  onProgress?: (progress: UploadProgress) => void,
  signal?: AbortSignal
): Promise<CloudinaryResult> {
  const form = new FormData()
  Object.entries(signed.fields).forEach(([key, value]) => form.append(key, value))
  form.append("file", file)
  return postForm(signed.uploadUrl, form, onProgress, signal)
}

export type UploadOptions = {
  /**
   * The event the photo belongs to, when there is one. The create-event wizard
   * has no id yet, so its uploads are filed under the planner instead.
   */
  eventId?: string
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

/**
 * Downscales, asks the API to authorise exactly this upload, then posts the
 * file straight to Cloudinary. Returns the delivery URL to store.
 */
export async function uploadPhoto(
  file: File,
  { eventId, onProgress, signal }: UploadOptions = {}
): Promise<{ url: string; bytes: number; originalBytes: number }> {
  onProgress?.({ ratio: null, loaded: 0, total: file.size })

  const image = await compressImage(file)

  const signed = await api.post<SignedUpload>(
    eventId ? `/api/events/${eventId}/uploads` : "/api/uploads",
    { contentType: image.contentType, size: image.blob.size }
  )

  const result = await uploadSignedBlob(signed, image.blob, onProgress, signal)

  return {
    url: result.secure_url,
    bytes: result.bytes,
    originalBytes: image.originalBytes,
  }
}

/**
 * Uploads a video or an animated image, for the envelope's opening clip.
 *
 * Shares `uploadAudio`'s route because it shares its reason: neither may be run
 * through `compressImage`, whose first act is to draw the file onto a canvas —
 * for anything that moves that yields one frame, or a blank one, and no error.
 */
export async function uploadClip(
  file: File,
  options: UploadOptions = {}
): Promise<{ url: string; bytes: number }> {
  return uploadAudio(file, options)
}

/**
 * Uploads a music track.
 *
 * Deliberately not `uploadPhoto` with a flag: that one's first act is to draw
 * the file onto a canvas and re-encode it, which for an mp3 produces a blank
 * image and no error. Audio goes up as the bytes the couple chose, because
 * there is nothing sensible to do to it in a browser and re-encoding a song is
 * not something to do by accident.
 */
export async function uploadAudio(
  file: File,
  { eventId, onProgress, signal }: UploadOptions = {}
): Promise<{ url: string; bytes: number }> {
  onProgress?.({ ratio: null, loaded: 0, total: file.size })

  const signed = await api.post<SignedUpload>(
    eventId ? `/api/events/${eventId}/uploads` : "/api/uploads",
    { contentType: file.type || "audio/mpeg", size: file.size }
  )

  const result = await uploadSignedBlob(signed, file, onProgress, signal)
  return { url: result.secure_url, bytes: result.bytes }
}

/* ------------------------------------------------------------------ delivery */

const CLOUDINARY_UPLOAD = "/image/upload/"

/** Widths offered to the browser. Covers phones through to a retina desktop. */
const SRCSET_WIDTHS = [480, 768, 1024, 1440, 2000]

/** Whether a delivery transformation can be applied to this URL at all. */
export function canTransform(url: string) {
  return isCloudinary(url)
}

function isCloudinary(url: string) {
  return url.includes("res.cloudinary.com") && url.includes(CLOUDINARY_UPLOAD)
}

/**
 * Inserts a transformation into a Cloudinary URL.
 *
 * `f_auto` serves AVIF or WebP depending on what the requesting browser
 * accepts, and `q_auto` picks a quality the image can survive. Together they
 * usually beat anything we could encode in advance, because they know the
 * client and we do not.
 */
export function cloudinaryUrl(url: string, transform: string): string {
  if (!isCloudinary(url)) return url
  return url.replace(CLOUDINARY_UPLOAD, `${CLOUDINARY_UPLOAD}${transform}/`)
}

/**
 * `src`/`srcSet`/`sizes` for a photo, so the browser downloads the width it
 * actually needs. Non-Cloudinary URLs (a pasted link, a sample photo) pass
 * through untouched.
 */
export function imageSrcSet(
  url: string,
  {
    sizes = "100vw",
    crop = "fill",
    effect = "",
  }: {
    sizes?: string
    crop?: "fill" | "fit"
    /**
     * A second transformation, applied after the resize — a look rather than a
     * size. Chained rather than merged because order matters: resizing first
     * means grain and vignette are computed against the pixels the viewer
     * actually gets, so a thumbnail is not a full-size effect shrunk into mush.
     */
    effect?: string
  } = {}
) {
  if (!isCloudinary(url)) return { src: url, srcSet: undefined, sizes: undefined }

  const tail = effect ? `/${effect}` : ""
  const srcSet = SRCSET_WIDTHS.map(
    (width) => `${cloudinaryUrl(url, `f_auto,q_auto,c_${crop},w_${width}${tail}`)} ${width}w`
  ).join(", ")

  return { src: cloudinaryUrl(url, `f_auto,q_auto,c_${crop},w_1024${tail}`), srcSet, sizes }
}

/**
 * The image a link preview shows. Fixed 1200x630 because that is what Facebook,
 * Telegram and the rest crop to — handing them the original means they crop it
 * themselves, usually through the couple's faces.
 */
export function openGraphImage(url: string): string {
  return cloudinaryUrl(url, "f_jpg,q_auto,c_fill,g_auto,w_1200,h_630")
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
