import { useState, useContext } from "react";
import { DateTime } from "luxon";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react";
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";


interface IMonthCalendarProps {
    onTicketClick: (ticket: Doc<"tickets">) => void;
}

export const MonthCalendar: React.FC<IMonthCalendarProps> = ({ onTicketClick }) => {
    const { currentProject, currentEpic } = useContext(UserContext);
    const { currentDate, setCurrentDate, dateByViewMode } = useContext(CalendarContext);
    const [draggedTicket, setDraggedTicket] = useState<Doc<"tickets"> | null>(null);
    const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const updateTicket = useMutation(api.tickets.update);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    const handleDayClick = (date: Date) => {
        setCurrentDate(date);
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
        const dateTime = DateTime.fromObject({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).toFormat('yyyy-MM-dd');
        return tickets?.filter(ticket => DateTime.fromMillis(ticket?.[dateByViewMode] as number ?? 0).toFormat('yyyy-MM-dd') === dateTime) ?? [];
    }

    const renderDays = (tickets: Doc<"tickets">[]) => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);
        let padCount = 0;
        const startDate = DateTime.fromObject({ year: currentDate.getFullYear(), month: currentDate.getMonth(), day: 1 }).minus({ days: firstDay + 1 }).toFormat('dd');


        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            if (padCount % 7 === 0) {
                days.push(<div key={`empty-${padCount}-${i}`} className="flex items-center justify-center text-xs text-gray-500">{startDate}</div>);
            }
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
            padCount++;
        }

        // Add cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            //   const dayEvents = getEventsForDay(date);
            const isSelected = currentDate?.getDate() === day;


            if (padCount % 7 === 0) {
                days.push(<div key={`empty-${padCount}-${day}`} className="flex items-center justify-center text-xs text-gray-500">{day}</div>);
            }

            const isDragOver = dragOverDate?.getDate() === date.getDate() &&
                dragOverDate?.getMonth() === date.getMonth() &&
                dragOverDate?.getFullYear() === date.getFullYear();

            days.push(
                <div
                    key={`day-${day}`}
                    className={`border border-gray-200 min-h-20 rounded-md px-4 py-3 cursor-pointer text-sm colour-blue-500 relative overflow-hidden flex flex-col ${isSelected ? 'bg-blue-50' : ''
                        } hover:border-blue-500 ${isDragOver ? 'bg-green-50 border-green-300' : ''
                        }`}
                    onClick={() => handleDayClick(date)}
                    onDragOver={(e) => handleDragOver(e, date)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                >
                    <div className="justify-right text-xs text-gray-500">{day}</div>
                    <div className="flex flex-col items-start justify-start w-full">
                        {ticketByDate((tickets ?? []), date).map(ticket => (
                            <div key={ticket._id} className="event-dot" title={ticket.title}>
                                <button
                                    className={`text-xs p-1 rounded-md border border-gray-200 text-white bg-blue-500 ${dateByViewMode === 'dueDate' ? 'cursor-grab active:cursor-grabbing' : ''
                                        }`}
                                    onClick={() => onTicketClick(ticket)}
                                    onDragStart={(e) => handleDragStart(e, ticket)}
                                    draggable={dateByViewMode === 'dueDate'}
                                >
                                    {ticket.title}
                                </button>
                            </div>
                        ))}

                    </div>
                </div>
            );
            padCount++;
        }
        return days;
    };


    return <div className="w-full m-auto border border-gray-200 rounded-md p-8 shadow-2xl">
        <div className="flex flex-row justify-between items-center gap-4 mb-4">
            <div>
                <div className="text-xl font-bold">{DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}</div>
            </div>
            <div>
                <button className="px-3 py-1 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm" onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).minus({ months: 1 }).toJSDate())}>Previous</button>
                <button className="px-3 py-1 ml-2 rounded-md text-sm font-medium bg-white text-gray-900 shadow-sm" onClick={() => setCurrentDate(DateTime.fromJSDate(currentDate).plus({ months: 1 }).toJSDate())}>Next</button>
            </div>
        </div>
        <div className="grid grid-cols-[20px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 w-full">
            <div className="flex items-center justify-center"></div>
            <div className="flex items-center justify-center">Sun</div>
            <div className="flex items-center justify-center">Mon</div>
            <div className="flex items-center justify-center">Tue</div>
            <div className="flex items-center justify-center">Wed</div>
            <div className="flex items-center justify-center">Thu</div>
            <div className="flex items-center justify-center">Fri</div>
            <div className="flex items-center justify-center">Sat</div>
            {renderDays(tickets ?? [])}
        </div>
    </div >
};