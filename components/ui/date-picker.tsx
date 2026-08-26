"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function parseISODate(value?: string): Date | undefined {
  if (!value) return undefined
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return undefined
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Replaces the native `<input type="date">`, whose calendar affordance
 * varies wildly across browsers and looks out of place next to the rest of
 * the app's controls. Value/onChange still speak plain "YYYY-MM-DD" so it
 * drops into existing form state unchanged.
 */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: {
  id?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const selected = parseISODate(value)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start gap-2 px-3 font-normal",
              !selected && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" aria-hidden="true" />
        {selected
          ? selected.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          key={value}
          mode="single"
          captionLayout="dropdown"
          startMonth={new Date(new Date().getFullYear() - 100, 0)}
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          defaultMonth={selected}
          selected={selected}
          onSelect={(date) => {
            if (!date) return
            onChange(toISODate(date))
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
