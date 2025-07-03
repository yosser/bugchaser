import { useContext, useEffect, useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel"
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";
import { MonthCalendar } from "./MonthCalendar";
import { WeekCalendar } from "./WeekCalendar";
import { YearCalendar } from "./YearCalendar";
import { DayCalendar } from "./DayCalendar";
import { EditTicket, ViewTicket } from "../ticket";

type ViewMode = "list" | "day" | "week" | "month" | "year";

export const Calendar: React.FC = () => {
    const { currentProject } = useContext(UserContext);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [showViewTicket, setShowViewTicket] = useState<Doc<'tickets'> | null>(null);
    const [ticketToEdit, setTicketToEdit] = useState<Doc<"tickets"> | null>(null);
    const [dateByViewMode, setDateByViewMode] = useState<Partial<keyof Doc<"tickets">>>('createdAt');

    const [viewMode, setViewMode] = useState<ViewMode>("month");

    useEffect(() => {
        setCurrentDate(new Date());
    }, [currentProject]);

    const viewModeOptions = [
        { label: "List", value: "list" },
        { label: "Day", value: "day" },
        { label: "Week", value: "week" },
        { label: "Month", value: "month" },
        { label: "Year", value: "year" },
    ];

    const handleTicketClick = (ticket: Doc<"tickets">) => {
        setShowViewTicket(ticket);
    };

    const onEditTicket = (ticket: Doc<"tickets">) => {
        setShowViewTicket(null);
        setTicketToEdit(ticket);
    };

    return <div className="p-4">
        <CalendarContext.Provider value={{ currentDate, setCurrentDate, dateByViewMode, setDateByViewMode }}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Calendar</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        {viewModeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setViewMode(option.value as ViewMode)}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === option.value
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                        <select
                            value={dateByViewMode}
                            onChange={(e) => setDateByViewMode(e.target.value as Partial<keyof Doc<"tickets">>)}
                            className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        >
                            <option value="createdAt">Created At</option>
                            <option value="updatedAt">Updated At</option>
                            <option value="dueDate">Due Date</option>
                        </select>
                    </div>
                </div>
            </div>
            {viewMode === "month" && <MonthCalendar onTicketClick={handleTicketClick} />}
            {viewMode === "week" && <WeekCalendar onTicketClick={handleTicketClick} />}
            {viewMode === "year" && <YearCalendar onTicketClick={handleTicketClick} />}
            {viewMode === "day" && <DayCalendar onTicketClick={handleTicketClick} />}
            {showViewTicket ? (
                <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-4xl">
                        <ViewTicket
                            ticketId={showViewTicket._id}
                            onEdit={onEditTicket}
                            onClose={() => setShowViewTicket(null)}
                        />
                    </div>
                </div>
            ) : null}
            {ticketToEdit && <EditTicket ticket={ticketToEdit} onClose={() => setTicketToEdit(null)} />}
        </CalendarContext.Provider>
    </div>
};