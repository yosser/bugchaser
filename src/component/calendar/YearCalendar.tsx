import { useState, useContext } from "react";
import { DateTime } from "luxon";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react";
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";

interface IYearCalendarProps {
    onTicketClick: (ticket: Doc<"tickets">) => void;
}

export const YearCalendar: React.FC<IYearCalendarProps> = ({ onTicketClick }) => {
    const { currentProject, currentEpic } = useContext(UserContext);
    const { currentDate, setCurrentDate, dateByViewMode } = useContext(CalendarContext);
    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
    const [draggedTicket, setDraggedTicket] = useState<Doc<"tickets"> | null>(null);
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const updateTicket = useMutation(api.tickets.update);

    // Get all months of the year
    const getMonths = (year: number) => {
        const months = [];
        for (let month = 0; month < 12; month++) {
            months.push(new Date(year, month, 1));
        }
        return months;
    };

    // Get the number of days in a month
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };


    // Get all dates for a month (no padding, starts from day 1)
    const getMonthDates = (date: Date) => {
        const daysInMonth = getDaysInMonth(date);
        const dates = [];

        // Add all days of the month starting from day 1
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(new Date(date.getFullYear(), date.getMonth(), day));
        }

        return dates;
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleDragStart = (e: React.DragEvent, ticket: Doc<"tickets">) => {
        if (dateByViewMode === 'dueDate') {
            setDraggedTicket(ticket);
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent, date: Date) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverDate(date);
        }
    };

    const handleDragLeave = () => {
        setDragOverDate(null);
    };

    const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();

            // Get the original time from the dragged ticket
            const originalDateTime = DateTime.fromMillis(draggedTicket.dueDate ?? 0);
            const originalHour = originalDateTime.hour;
            const originalMinute = originalDateTime.minute;
            const originalSecond = originalDateTime.second;
            const originalMillisecond = originalDateTime.millisecond;

            // Create new due date with the target date but preserve the original time
            const newDueDate = DateTime.fromJSDate(targetDate)
                .set({
                    hour: originalHour,
                    minute: originalMinute,
                    second: originalSecond,
                    millisecond: originalMillisecond
                })
                .toMillis();

            try {
                await updateTicket({
                    id: draggedTicket._id,
                    dueDate: newDueDate
                });
            } catch (error) {
                console.error('Failed to update ticket due date:', error);
            }

            setDraggedTicket(null);
            setDragOverDate(null);
        }
    };

    const ticketByDate = (tickets: Doc<"tickets">[], date: Date): Array<Doc<"tickets">> => {
        const dateTime = DateTime.fromObject({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
        }).toFormat('yyyy-MM-dd');
        return tickets?.filter(ticket =>
            DateTime.fromMillis(ticket?.[dateByViewMode] as number ?? 0).toFormat('yyyy-MM-dd') === dateTime
        ) ?? [];
    };

    const months = getMonths(currentDate.getFullYear());
    const maxDatesInMonth = Math.max(...months.map(month => getMonthDates(month).length));

    return (
        <div className="w-full m-auto border border-gray-200 rounded-md p-8 shadow-2xl">
            <div className="flex flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <div className="text-xl font-bold">{currentDate.getFullYear()}</div>
                </div>
                <div>
                    <button
                        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).minus({ years: 1 }).toJSDate())}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 ml-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).plus({ years: 1 }).toJSDate())}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 w-full overflow-x-auto">
                {/* Header row with month names */}
                <div className="flex items-center justify-center p-2 font-medium text-sm text-gray-600"></div>
                {months.map((month, monthIndex) => (
                    <div
                        key={monthIndex}
                        className="flex items-center justify-center p-2 font-medium text-sm text-gray-700 border-b border-gray-200"
                    >
                        {DateTime.fromJSDate(month).toFormat('MMM')}
                    </div>
                ))}

                {/* Date rows */}
                {Array.from({ length: maxDatesInMonth }, (_, rowIndex) => (
                    <div key={rowIndex} className="contents">
                        {/* Row label (day number) */}
                        <div className="flex items-center justify-center p-1 text-xs text-gray-500 border-r border-gray-200 font-medium">
                            {rowIndex + 1}
                        </div>

                        {/* Month columns */}
                        {months.map((month, monthIndex) => {
                            const monthDates = getMonthDates(month);
                            const date = monthDates[rowIndex];

                            if (!date) {
                                return (
                                    <div
                                        key={`${monthIndex}-${rowIndex}`}
                                        className="min-h-8 border-b border-gray-100 p-1"
                                    ></div>
                                );
                            }

                            const dayTickets = ticketByDate(tickets ?? [], date);
                            const isSelected = selectedDate?.getDate() === date.getDate() &&
                                selectedDate?.getMonth() === date.getMonth() &&
                                selectedDate?.getFullYear() === date.getFullYear();

                            const isToday = DateTime.fromJSDate(date).toFormat('yyyy-MM-dd') === DateTime.now().toFormat('yyyy-MM-dd');
                            const isDragOver = dragOverDate?.getDate() === date.getDate() &&
                                dragOverDate?.getMonth() === date.getMonth() &&
                                dragOverDate?.getFullYear() === date.getFullYear();

                            return (
                                <div
                                    key={`${monthIndex}-${rowIndex}`}
                                    className={`min-h-8 border-b border-gray-100 p-1 relative ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        } ${isDragOver ? 'bg-green-50 border-green-300' : ''
                                        }`}
                                    onClick={() => handleDateClick(date)}
                                    onDragOver={(e) => handleDragOver(e, date)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, date)}
                                >
                                    <div className={`text-xs font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'
                                        }`}>
                                        {date.getDate()}
                                    </div>
                                    <div className="flex flex-col gap-0.5 mt-1">
                                        {dayTickets.slice(0, 2).map((ticket) => (
                                            <div
                                                key={ticket._id}
                                                className="w-full"
                                            >
                                                <button
                                                    className={`text-xs p-0.5 rounded border border-gray-200 text-white bg-blue-500 hover:bg-blue-600 w-full text-left truncate ${dateByViewMode === 'dueDate' ? 'cursor-grab active:cursor-grabbing' : ''
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTicketClick(ticket);
                                                    }}
                                                    onDragStart={(e) => handleDragStart(e, ticket)}
                                                    draggable={dateByViewMode === 'dueDate'}
                                                    title={ticket.title}
                                                >
                                                    {ticket.title}
                                                </button>
                                            </div>
                                        ))}
                                        {dayTickets.length > 2 && (
                                            <div className="text-xs text-gray-500 text-center">
                                                +{dayTickets.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}; 