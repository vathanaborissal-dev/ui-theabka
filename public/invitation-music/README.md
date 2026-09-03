# Invitation music

Drop `.mp3` files here using **exactly** the names below. Each one corresponds
to an entry in `lib/invitation/music.ts`; a track whose file is missing is
offered in the picker but plays nothing, so the app works before the audio
arrives and improves as it lands.

| file                 | shown as                     |
| -------------------- | ---------------------------- |
| `pleng-kar.mp3`      | Pleng Kar / ភ្លេងការ          |
| `khmer-strings.mp3`  | Khmer strings / ខ្សែតន្ត្រីខ្មែរ |
| `romvong.mp3`        | Romvong / រាំវង់              |
| `piano-soft.mp3`     | Soft piano / ព្យាណូស្រាល       |
| `acoustic-warm.mp3`  | Warm acoustic / អាកូស្ទិកទន់ភ្លន់ |

Keep them small — this plays over mobile data on a page people open once.
Roughly 128 kbps mono is plenty for background music; a 3-minute track should
land near 2–3 MB.

Record the licence for each file in `credits.json` before shipping. An
invitation link is a public page, so anything here is being performed publicly.

To add a track that is not on this list, add an entry to `MUSIC_TRACKS` in
`lib/invitation/music.ts` as well as dropping the file here.
