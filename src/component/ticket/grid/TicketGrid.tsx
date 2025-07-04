import { useContext, useState, useRef } from "react";

import { useQuery, useMutation } from "convex/react";
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDragRef } from "../../../hooks/hooks";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { TicketCard } from "./TicketCard";

import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";


interface TicketGridProps {
    onTicketClick?: (ticket: Doc<"tickets">) => void;
    setShowViewTicket?: (ticketId: Id<"tickets">) => void;
}

interface IAssignedToColumnProps {
    assignedTo: Doc<"users">;
    tickets: Doc<"tickets">[];
    onTicketEdit?: (ticket: Doc<"tickets">) => void;
    onDrop: (ticket: Doc<"tickets">, assignedToId: Id<"users">) => void;
    setShowViewTicket?: (ticketId: Id<"tickets">) => void;
}

const AssignedToColumn = ({ assignedTo, tickets, onTicketEdit, onDrop, setShowViewTicket }: IAssignedToColumnProps) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TICKET',
        drop: (item: Doc<"tickets">) => {
            onDrop(item, assignedTo._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const handleDropRef = useDragRef(drop);
    const columnTickets = tickets.filter(ticket => ticket.assignedTo === assignedTo._id);

    return (<div ref={handleDropRef}
        className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
            }`}
    >
        <h3 className="text-lg font-semibold mb-4">{assignedTo.name}</h3>
        <div className="space-y-4">
            {columnTickets.map((ticket) => {
                return (
                    <TicketCard
                        key={ticket._id}
                        ticket={ticket}
                        onEdit={onTicketEdit}
                        setShowViewTicket={setShowViewTicket}
                    />
                );
            })}
        </div>
    </div >
    );
};

interface IPriorityColumnProps {
    priority: Doc<"priority">;
    tickets: Doc<"tickets">[];
    onTicketEdit?: (ticket: Doc<"tickets">) => void;
    onDrop: (ticket: Doc<"tickets">, priorityId: Id<"priority">) => void;
    setShowViewTicket?: (ticketId: Id<"tickets">) => void;
}

const PriorityColumn = ({ priority, tickets, onTicketEdit, onDrop, setShowViewTicket }: IPriorityColumnProps) => {
    const dropRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TICKET',
        drop: (item: Doc<"tickets">) => {
            onDrop(item, priority._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    drop(dropRef);

    const columnTickets = tickets.filter(ticket => ticket.priority === priority._id);

    return (
        <div
            ref={dropRef}
            className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
                }`}
        >
            <h3 className="text-lg font-semibold mb-4">{priority.name}</h3>
            <div className="space-y-4">
                {columnTickets.map((ticket) => {
                    return (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            onEdit={onTicketEdit}
                            setShowViewTicket={setShowViewTicket}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface IStatusColumnProps {
    status: Doc<"status">;
    tickets: Doc<"tickets">[];
    onTicketEdit?: (ticket: Doc<"tickets">) => void;
    onDrop: (ticket: Doc<"tickets">, statusId: Id<"status">) => void;
    setShowViewTicket?: (ticketId: Id<"tickets">) => void;
}

const StatusColumn = ({ status, tickets, onTicketEdit, onDrop, setShowViewTicket }: IStatusColumnProps) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'TICKET',
        drop: (item: Doc<"tickets">) => {
            onDrop(item, status._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const handleDropRef = useDragRef(drop);

    const columnTickets = tickets.filter(ticket => ticket.status === status._id);

    return (
        <div
            ref={handleDropRef}
            className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
                }`}
        >
            <h3 className="text-lg font-semibold mb-4">{status.name}</h3>
            <div className="space-y-4">
                {columnTickets.map((ticket) => {

                    return (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            onEdit={onTicketEdit}
                            setShowViewTicket={setShowViewTicket}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const TicketGrid = ({ onTicketClick, setShowViewTicket }: TicketGridProps) => {
    const { currentUser, currentProject, currentEpic } = useContext<IUserContext>(UserContext);
    const [columnView, setColumnView] = useState<'status' | 'priority' | 'assignedTo'>('assignedTo');
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const updateTicket = useMutation(api.tickets.update);
    const createLog = useMutation(api.logs.create);

    const handleDrop = async (ticket: Doc<"tickets">, priorityId: Id<"priority">) => {
        const priority = priorities?.find(p => p._id === priorityId);

        try {
            await updateTicket({
                id: ticket._id, priority: priorityId,
            });

            await createLog({
                action: `Ticket priority changed to ${priority?.name}`,
                user: currentUser?._id,
                ticket: ticket._id,
            });

        } catch (error) {
            console.error('Failed to update ticket priority:', error);
        }
    };

    const handleDropStatus = async (ticket: Doc<"tickets">, statusId: Id<"status">) => {
        const status = statuses?.find(s => s._id === statusId);

        try {
            await updateTicket({ id: ticket._id, status: statusId });
            await createLog({
                action: `Ticket status changed to ${status?.name}`,
                user: currentUser?._id,
                ticket: ticket._id,
            });
        } catch (error) {
            console.error('Failed to update ticket status:', error);
        }
    };

    const handleDropAssignedTo = async (ticket: Doc<"tickets">, assignedToId: Id<"users">) => {
        const assignedTo = users?.find(u => u._id === assignedToId);

        try {
            await updateTicket({ id: ticket._id, assignedTo: assignedToId });
            await createLog({
                action: `Ticket assigned to ${assignedTo?.name}`,
                user: currentUser?._id,
                ticket: ticket._id,
            });
        } catch (error) {
            console.error('Failed to update ticket assigned to:', error);
        }
    };

    if (!tickets || !users || !statuses || !priorities) {
        return <div>Loading...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-4">
                <div className="flex items-center justify-end space-x-2 bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">View by:</span>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setColumnView('status')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'status'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Status
                        </button>
                        <button
                            onClick={() => setColumnView('priority')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'priority'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Priority
                        </button>
                        <button
                            onClick={() => setColumnView('assignedTo')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'assignedTo'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Assigned To
                        </button>
                    </div>
                </div>

                {columnView === 'status' ? (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${statuses.length}, 1fr)` }}>
                        {statuses.map((status) => (
                            <StatusColumn
                                key={status._id}
                                status={status}
                                tickets={tickets}
                                onTicketEdit={onTicketClick}
                                onDrop={handleDropStatus}
                                setShowViewTicket={setShowViewTicket}
                            />
                        ))}
                    </div>
                ) : columnView === 'assignedTo' ? (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${users.length}, 1fr)` }}>
                        {users.map((user) => (
                            <AssignedToColumn
                                key={user._id}
                                assignedTo={user}
                                tickets={tickets}
                                onTicketEdit={onTicketClick}
                                onDrop={handleDropAssignedTo}
                                setShowViewTicket={setShowViewTicket}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${priorities.length}, 1fr)` }}>
                        {priorities.map((priority) => (
                            <PriorityColumn
                                key={priority._id}
                                priority={priority}
                                tickets={tickets}
                                onTicketEdit={onTicketClick}
                                onDrop={handleDrop}
                                setShowViewTicket={setShowViewTicket}
                            />
                        ))}
                    </div>
                )}
            </div>

        </DndProvider>
    );
}; 