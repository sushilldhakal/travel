"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps extends React.HTMLAttributes<HTMLDivElement> {
    date?: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
    className,
    date,
    setDate,
}: DatePickerWithRangeProps) {
    // If no date is provided, use a default range
    const selectedDate = date || {
        from: undefined,
        to: undefined,
    };

    // Create a ref to track if the component has been mounted
    const hasBeenMounted = React.useRef(false);

    // Effect to make sure we handle dates correctly even after remounting
    React.useEffect(() => {
        // Only set date if from or to has changed and component has been mounted

        hasBeenMounted.current = true;
    }, [date]);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate?.from && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate?.from ? (
                            selectedDate.to ? (
                                <>
                                    {format(selectedDate.from, "LLL dd, y")} -{" "}
                                    {format(selectedDate.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(selectedDate.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-fit p-0 min-w-[800px]" align="start" sideOffset={4}>
                    <Calendar
                        mode="range"
                        defaultMonth={selectedDate?.from}
                        selected={selectedDate}
                        onSelect={setDate}
                        numberOfMonths={2}
                        captionLayout="dropdown"
                        fixedWeeks
                        showOutsideDays
                        disabled={(date) => date < new Date("1900-01-01")}
                        className="p-4 [--cell-size:--spacing(10)]"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}