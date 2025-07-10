import { useContext, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import Select from "react-select";
import type { MultiValue } from "react-select";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { UserContext } from "../../context/userContext";
import { CalendarContext } from "../../context/calendarContext";
import type { IUserContext } from "../../context/userContext";

interface ListViewProps {
    onTicketClick?: (ticket: Doc<"tickets">) => void;
}

interface TicketCellProps {
    tickets: Doc<"tickets">[];
    onTicketClick?: (ticket: Doc<"tickets">) => void;
}

const TicketCell = ({ tickets, onTicketClick }: TicketCellProps) => {
    const priorities = useQuery(api.priority.get);
    if (tickets.length === 0) {
        return <div className="h-16 bg-gray-50 border-r border-b border-gray-200"></div>;
    }

    return (
        <div className="h-16 bg-white border-r border-b border-gray-200 p-1 overflow-hidden">
            <div className="space-y-1 max-h-full overflow-y-auto">
                {tickets.map((ticket) => (
                    <div
                        key={ticket._id}
                        onClick={() => onTicketClick?.(ticket)}
                        className="text-xs p-1 rounded cursor-pointer hover:bg-blue-50 transition-colors truncate"
                        style={{
                            backgroundColor: getPriorityColour(priorities?.find(p => p._id === ticket.priority)),
                            color: getPriorityTextColour(priorities?.find(p => p._id === ticket.priority))
                        }}
                        title={`${ticket.title} - ${ticket.status}`}
                    >
                        {ticket.title}
                    </div>
                ))}
            </div>
        </div>
    );
};

const getPriorityColour = (priority?: Doc<"priority">) => {
    // This would need to be enhanced with actual priority colors from the database
    return priority?.colour ?? "#f8fafc"; // slate-50 as default
};

const getPriorityTextColour = (priority?: Doc<"priority">) => {
    return priority?.textColour ?? "#888a8c";
};

const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

export const ListView = ({ onTicketClick }: ListViewProps) => {
    const { currentProject, currentEpic } = useContext<IUserContext>(UserContext);
    const { currentDate, dateByViewMode } = useContext(CalendarContext);
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const [showWeekends, setShowWeekends] = useState(true);

    const tickets = useQuery(api.tickets.getByProjectEpic, {
        projectId: currentProject?._id ?? undefined,
        epicId: currentEpic?._id ?? undefined
    });
    const users = useQuery(api.users.get);
    const priorities = useQuery(api.priority.get);

    const dateRange = useMemo(() => {
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 7); // One week before

        const endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 2); // Two months ahead

        const dates: Date[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6

            if (showWeekends || !isWeekend) {
                dates.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }, [currentDate, showWeekends]);

    // Filter users based on selection - if no users selected, show all users
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (selectedUsers.length === 0) return users;
        return users.filter(user => selectedUsers.includes(user._id));
    }, [users, selectedUsers]);

    // User options for react-select
    const userOptions = useMemo(() => {
        if (!users) return [];
        return users.map(user => ({
            value: user._id,
            label: user.name
        }));
    }, [users]);

    const handleUserSelectionChange = (selectedOptions: MultiValue<{ value: Id<"users">; label: string }>) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedUsers(selectedIds);
    };

    const getTicketsForDateAndUser = (date: Date, userId: Id<"users">): Doc<"tickets">[] => {
        if (!tickets) return [];

        return tickets.filter(ticket => {
            if (ticket.assignedTo !== userId) return false;

            let ticketDate: Date;

            switch (dateByViewMode) {
                case 'createdAt':
                    ticketDate = new Date(ticket.createdAt || 0);
                    break;
                case 'updatedAt':
                    ticketDate = new Date(ticket.updatedAt || 0);
                    break;
                case 'dueDate':
                    if (!ticket.dueDate) return false;
                    ticketDate = new Date(ticket.dueDate);
                    break;
                default:
                    ticketDate = new Date(ticket.createdAt || 0);
            }

            return isSameDay(ticketDate, date);
        });
    };

    if (!tickets || !users || !priorities) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex w-full flex-row-reverse gap-4">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Users</h3>
                        <button
                            onClick={() => setSelectedUsers([])}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Show All
                        </button>
                    </div>
                    <Select
                        isMulti
                        options={userOptions}
                        onChange={handleUserSelectionChange}
                        value={selectedUsers.map(user => ({ value: user, label: users?.find(u => u._id === user)?.name ?? '' }))}
                        placeholder="Select users..."
                        className="w-full"
                        classNamePrefix="select"
                        isClearable
                        isSearchable
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        {selectedUsers.length === 0
                            ? "Showing all users"
                            : `Showing ${selectedUsers.length} selected user${selectedUsers.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>

                <div>
                    {/* Weekend Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 mr-2">
                            Show Weekends
                        </label>
                        <button
                            onClick={() => setShowWeekends(!showWeekends)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${showWeekends ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showWeekends ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {showWeekends ? "Including Saturday and Sunday" : "Weekdays only"}
                    </p>

                </div>
            </div>
            <div className="flex gap-4">
                {/* User Selection Controls */}

                {/* Calendar Table */}
                <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200 min-w-[120px]">
                                        Date
                                    </th>
                                    {filteredUsers.map((user) => (
                                        <th key={user._id} className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-200 min-w-[200px]">
                                            {user.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dateRange.map((date) => (
                                    <tr key={date.toISOString()} className="hover:bg-gray-50">
                                        <td className="sticky left-0 z-10 bg-white px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{formatDate(date)}</span>

                                            </div>
                                        </td>
                                        {filteredUsers.map((user) => (
                                            <td key={user._id} className="p-0">
                                                <TicketCell
                                                    tickets={getTicketsForDateAndUser(date, user._id)}
                                                    onTicketClick={onTicketClick}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};
