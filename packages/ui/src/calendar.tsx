"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "./lib/utils";

type CalendarProps = DayPickerProps;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("w-full p-3", className)}
      classNames={{
        months: "flex w-full flex-col sm:flex-row gap-2",
        month: "flex w-full flex-col gap-4",
        month_caption:
          "flex justify-center pt-1 relative items-center text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
        button_next:
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md",
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "flex-1 text-center text-muted-foreground font-normal text-xs",
        week: "flex w-full mt-2",
        day: "flex-1 text-center text-sm relative p-0 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day_button:
          "w-full aspect-square p-0 font-normal inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-accent text-accent-foreground rounded-md",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
export type { CalendarProps };
