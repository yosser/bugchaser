import { createContext } from "react";
import type { Doc } from "../../convex/_generated/dataModel";

export interface ICalendarContext {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    dateByViewMode: Partial<keyof Doc<"tickets">>;
    setDateByViewMode: (dateByViewMode: Partial<keyof Doc<"tickets">>) => void;
}

export const CalendarContext = createContext<ICalendarContext>({ currentDate: new Date(), setCurrentDate: () => { }, dateByViewMode: 'createdAt', setDateByViewMode: () => { } });
