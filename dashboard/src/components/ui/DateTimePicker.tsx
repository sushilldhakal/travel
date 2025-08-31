"use client"

import * as React from "react"
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [timeValue, setTimeValue] = React.useState(() => {
    if (value) {
      const date = new Date(value)
      return format(date, 'HH:mm')
    }
    return '09:00'
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    // Parse the current time value
    const [hours, minutes] = timeValue.split(':').map(Number)

    // Set the time on the selected date
    const newDateTime = new Date(date)
    newDateTime.setHours(hours, minutes, 0, 0)

    setSelectedDate(newDateTime)
    onChange?.(newDateTime.toISOString())
  }

  const handleTimeChange = (newTime: string) => {
    if (!isValidTimeFormat(newTime)) return

    setTimeValue(newTime)

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, 0, 0)

      setSelectedDate(newDateTime)
      onChange?.(newDateTime.toISOString())
    }
  }

  const isValidTimeFormat = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder
    return format(selectedDate, 'PPP p')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0" align="start" sideOffset={4}>
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            captionLayout="dropdown"
          />
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="time" className="text-sm font-medium">
                Time
              </Label>
            </div>
            <div className="mt-2">
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
