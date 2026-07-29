import { useState } from "react"
import { CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function formatDate(date: Date | undefined): string {
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Select…"
}

function DatePickerField({
  label,
  date,
  onChange,
}: {
  label: string
  date: Date | undefined
  onChange: (date: Date | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex-none text-meta font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="flex h-7 items-center gap-icon rounded-md border border-input bg-transparent px-2 text-sm outline-none transition-colors select-none hover:bg-muted">
          <CalendarIcon aria-hidden="true" className="size-3.5 text-ink-faint" />
          {formatDate(date)}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(next) => {
              onChange(next)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function GraphDateRangeBar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line-subtle px-panel-x py-2">
      <DatePickerField label="From" date={startDate} onChange={onStartDateChange} />
      <DatePickerField label="To" date={endDate} onChange={onEndDateChange} />
    </div>
  )
}
