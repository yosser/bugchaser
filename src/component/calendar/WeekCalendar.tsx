import { useState, useContext } from "react";
import { DateTime } from "luxon";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react";
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";


interface IWeekCalendarProps {
    onTicketClick: (ticket: Doc<"tickets">) => void;
}

export const WeekCalendar: React.FC<IWeekCalendarProps> = ({ onTicketClick }) => {
    const { currentProject } = useContext(UserContext);
    const { currentDate, setCurrentDate, dateByViewMode } = useContext(CalendarContext);

    const [selectedDate, setSelectedDate] = useState<Date>(currentDate);
    const [showAllDay, setShowAllDay] = useState(false);
    const [draggedTicket, setDraggedTicket] = useState<Doc<"tickets"> | null>(null);
    const [dragOverCell, setDragOverCell] = useState<{ day: Date; hour: number } | null>(null);
    const tickets = useQuery(api.tickets.getByProject, { projectId: currentProject?._id });
    const updateTicket = useMutation(api.tickets.update);

    // Get the start of the week (Sunday)
    const getWeekStart = (date: Date) => {
        const dt = DateTime.fromJSDate(date);
        return dt.startOf('week').toJSDate();
    };

    // Get all days of the week
    const getWeekDays = (date: Date) => {
        const weekStart = getWeekStart(date);
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(DateTime.fromJSDate(weekStart).plus({ days: i }).toJSDate());
        }
        return days;
    };

    // Generate time slots (8 AM to 6 PM, or 24 hours if showAllDay is true)
    const getTimeSlots = () => {
        const slots = [];
        const startHour = showAllDay ? 0 : 8;
        const endHour = showAllDay ? 23 : 18;
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(hour);
        }
        return slots;
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleDragStart = (e: React.DragEvent, ticket: Doc<"tickets">) => {
        if (dateByViewMode === 'dueDate') {
            setDraggedTicket(ticket);
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverCell({ day, hour });
        }
    };

    const handleDragLeave = () => {
        setDragOverCell(null);
    };

    const handleDrop = async (e: React.DragEvent, targetDay: Date, targetHour: number) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();

            // Create new due date with the target day and hour
            const newDueDate = DateTime.fromJSDate(targetDay)
                .set({ hour: targetHour, minute: 0, second: 0, millisecond: 0 })
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
            setDragOverCell(null);
        }
    };

    const ticketByDateHour = (tickets: Doc<"tickets">[], date: Date, hour: number): Array<Doc<"tickets">> => {
        const dateTime = DateTime.fromObject({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour
        }).toFormat('yyyy-MM-dd:HH');
        return tickets?.filter(ticket =>
            DateTime.fromMillis(ticket?.[dateByViewMode] as number ?? 0).toFormat('yyyy-MM-dd:HH') === dateTime
        ) ?? [];
    };

    const weekDays = getWeekDays(currentDate);
    const timeSlots = getTimeSlots();

    return (
        <div className="w-full m-auto border border-gray-200 rounded-md p-8 shadow-2xl">
            <div className="flex flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <div className="text-xl font-bold">
                        {DateTime.fromJSDate(weekDays[0]).toFormat('MMM d')} - {DateTime.fromJSDate(weekDays[6]).toFormat('MMM d, yyyy')}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowAllDay(!showAllDay)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${showAllDay
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-900 shadow-sm"
                            }`}
                    >
                        {showAllDay ? "Show Business Hours" : "Show All Day"}
                    </button>
                    <button
                        className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).minus({ weeks: 1 }).toJSDate())}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 ml-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).plus({ weeks: 1 }).toJSDate())}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-1 w-full">
                {/* Header row with day names */}
                <div className="flex items-center justify-center p-2 font-medium text-sm text-gray-600"></div>
                {weekDays.map((day, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center justify-center p-2 font-medium text-sm cursor-pointer rounded-md ${selectedDate?.getDate() === day.getDate() &&
                            selectedDate?.getMonth() === day.getMonth() &&
                            selectedDate?.getFullYear() === day.getFullYear()
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        onClick={() => handleDayClick(day)}
                    >
                        <div>{DateTime.fromJSDate(day).toFormat('EEE')}</div>
                        <div className="text-lg font-bold">{day.getDate()}</div>
                    </div>
                ))}

                {/* Time slots */}
                {timeSlots.map((hour) => (
                    <div key={hour} className="contents">
                        {/* Time label */}
                        <div className="flex items-center justify-end pr-2 text-xs text-gray-500 border-r border-gray-200">
                            {DateTime.fromObject({ hour }).toFormat('h a')}
                        </div>

                        {/* Day columns */}
                        {weekDays.map((day, dayIndex) => {
                            const dayTickets = ticketByDateHour(tickets ?? [], day, hour);
                            const isSelected = selectedDate?.getDate() === day.getDate() &&
                                selectedDate?.getMonth() === day.getMonth() &&
                                selectedDate?.getFullYear() === day.getFullYear();
                            const isDragOver = dragOverCell?.day.getDate() === day.getDate() &&
                                dragOverCell?.day.getMonth() === day.getMonth() &&
                                dragOverCell?.day.getFullYear() === day.getFullYear() &&
                                dragOverCell?.hour === hour;

                            return (
                                <div
                                    key={`${dayIndex}-${hour}`}
                                    className={`min-h-16 border-b border-gray-100 p-1 relative ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        } ${isDragOver ? 'bg-green-50 border-green-300' : ''
                                        }`}
                                    onDragOver={(e) => handleDragOver(e, day, hour)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, day, hour)}
                                >
                                    {
                                        dayTickets.map((ticket) => (
                                            <div
                                                key={ticket._id}
                                                className="mb-1"
                                            >
                                                <button
                                                    className={`text-xs p-1 rounded-md border border-gray-200 text-white bg-blue-500 hover:bg-blue-600 w-full text-left truncate ${dateByViewMode === 'dueDate' ? 'cursor-grab active:cursor-grabbing' : ''
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
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}; 