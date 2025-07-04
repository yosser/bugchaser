import { useState, useContext } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { AddTicket } from "../add/AddTicket.tsx";

import { UserContext } from "../../../context/userContext";

interface TicketListProps {
    onViewTicket: (ticket: Doc<"tickets">) => void;
    onEditTicket: (ticket: Doc<"tickets">) => void;
}

export const TicketList: React.FunctionComponent<TicketListProps> = ({ onViewTicket, onEditTicket }) => {
    const { currentProject, currentEpic } = useContext(UserContext);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const epics = useQuery(api.epics.get);
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const ticketTypes = useQuery(api.ticketType.get);
    const removeTicket = useMutation(api.tickets.remove);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (!currentProject) {
        return <div className="p-4 text-gray-500">Please select a project to view tickets.</div>;
    }

    const handleDelete = async (id: Id<"tickets">) => {
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            try {
                await removeTicket({ id });
            } catch (error) {
                console.error("Failed to delete ticket:", error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Epic
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned To
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tickets?.map((ticket) => (
                            <tr key={ticket._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{ticketTypes?.find(t => t._id === ticket.type)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{statuses?.find(s => s._id === ticket.status)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{priorities?.find(p => p._id === ticket.priority)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{epics?.find(e => e._id === ticket.epic)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{users?.find(u => u._id === ticket.assignedTo)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onViewTicket(ticket)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => onEditTicket(ticket)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ticket._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <AddTicket onClose={() => setIsAddModalOpen(false)} />
            )}


        </div>
    );
}; 