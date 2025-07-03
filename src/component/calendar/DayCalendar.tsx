import { useState, useContext } from "react";
import { DateTime } from "luxon";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react";
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";

interface IDayCalendarProps {
    onTicketClick: (ticket: Doc<"tickets">) => void;
}

export const DayCalendar: React.FC<IDayCalendarProps> = ({ onTicketClick }) => {
    const { currentDate, setCurrentDate, dateByViewMode } = useContext(CalendarContext);
    const { currentProject } = useContext(UserContext);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [showAllDay, setShowAllDay] = useState(false);
    const [draggedTicket, setDraggedTicket] = useState<Doc<"tickets"> | null>(null);
    const [dragOverHour, setDragOverHour] = useState<number | null>(null);
    const tickets = useQuery(api.tickets.getByProject, { projectId: currentProject?._id });
    const updateTicket = useMutation(api.tickets.update);

    // Generate time slots (6 AM to 10 PM, or 24 hours if showAllDay is true)
    const getTimeSlots = () => {
        const slots = [];
        const startHour = showAllDay ? 0 : 8;
        const endHour = showAllDay ? 23 : 18;
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(hour);
        }
        return slots;
    };

    const handleTimeSlotClick = (hour: number) => {
        setSelectedTime(hour);
    };

    const handleDragStart = (e: React.DragEvent, ticket: Doc<"tickets">) => {
        if (dateByViewMode === 'dueDate') {
            setDraggedTicket(ticket);
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent, hour: number) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverHour(hour);
        }
    };

    const handleDragLeave = () => {
        setDragOverHour(null);
    };

    const handleDrop = async (e: React.DragEvent, targetHour: number) => {
        if (dateByViewMode === 'dueDate' && draggedTicket) {
            e.preventDefault();

            // Create new due date with the target hour
            const newDueDate = DateTime.fromJSDate(currentDate)
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
            setDragOverHour(null);
        }
    };

    const ticketByDateHour = (tickets: Doc<"tickets">[], date: Date, hour: number): Array<Doc<"tickets">> => {
        const dateTime = DateTime.fromObject({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour
        }).toFormat('yyyy-MM-dd:HH');
        return tickets?.filter(ticket => ticket.dueDate &&
            DateTime.fromMillis(ticket?.[dateByViewMode] as number ?? 0).toFormat('yyyy-MM-dd:HH') === dateTime
        ) ?? [];
    };

    const timeSlots = getTimeSlots();
    const isToday = DateTime.fromJSDate(currentDate).toFormat('yyyy-MM-dd') === DateTime.now().toFormat('yyyy-MM-dd');

    return (
        <div className="w-full m-auto border border-gray-200 rounded-md p-8 shadow-2xl">
            <div className="flex flex-row justify-between items-center gap-4 mb-4">
                <div>
                    <div className="text-xl font-bold">
                        {DateTime.fromJSDate(currentDate).toFormat('EEEE, MMMM d, yyyy')}
                    </div>
                    {isToday && (
                        <div className="text-sm text-blue-600 font-medium">Today</div>
                    )}
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
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).minus({ days: 1 }).toJSDate())}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 ml-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm"
                        onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).plus({ days: 1 }).toJSDate())}
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-1 w-full">
                {/* Header row */}
                <div className="flex items-center justify-center p-2 font-medium text-sm text-gray-600 border-b border-gray-200">
                    Time
                </div>
                <div className="flex items-center justify-center p-2 font-medium text-sm text-gray-700 border-b border-gray-200">
                    Events
                </div>

                {/* Time slots */}
                {timeSlots.map((hour) => {
                    const hourTickets = ticketByDateHour(tickets ?? [], currentDate, hour);
                    const isSelected = selectedTime === hour;
                    const isCurrentHour = isToday && hour === DateTime.now().hour;

                    return (
                        <div key={hour} className="contents">
                            {/* Time label */}
                            <div className={`flex items-center justify-end pr-4 text-sm font-medium border-r border-gray-200 ${isCurrentHour ? 'text-blue-600 font-bold' : 'text-gray-700'
                                }`}>
                                {DateTime.fromObject({ hour }).toFormat('h a')}
                            </div>

                            {/* Events column */}
                            <div
                                className={`min-h-20 border-b border-gray-100 p-3 relative ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                    } ${dragOverHour === hour ? 'bg-green-50 border-green-300' : ''
                                    }`}
                                onClick={() => handleTimeSlotClick(hour)}
                                onDragOver={(e) => handleDragOver(e, hour)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, hour)}
                            >
                                {hourTickets.length === 0 ? (
                                    <div className="text-sm text-gray-400 italic">
                                        No events scheduled
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {hourTickets.map((ticket) => (
                                            <div
                                                key={ticket._id}
                                                className="w-full"
                                            >
                                                <button
                                                    className={`text-sm p-2 rounded-md border border-gray-200 text-white bg-blue-500 hover:bg-blue-600 w-full text-left ${dateByViewMode === 'dueDate' ? 'cursor-grab active:cursor-grabbing' : ''
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onTicketClick(ticket);
                                                    }}
                                                    onDragStart={(e) => handleDragStart(e, ticket)}
                                                    draggable={dateByViewMode === 'dueDate'}
                                                    title={ticket.title}
                                                >
                                                    <div className="font-medium">{ticket.title}</div>
                                                    <div className="text-xs opacity-90">
                                                        {DateTime.fromMillis(ticket?.[dateByViewMode] as number ?? 0).toFormat('h:mm a')}
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}; 