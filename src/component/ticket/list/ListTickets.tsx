import { useContext, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";
import { AddTicket } from "../add";
import { EditTicket } from "../edit";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import { TicketGrid } from "../grid/TicketGrid";
import { TicketList } from "./TicketList";
import { ViewTicket } from "../view/ViewTicket";

type ViewMode = "grid" | "list";

export const ListTickets = () => {
    const { currentProject, currentEpic } = useContext(UserContext);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const [showViewTicket, setShowViewTicket] = useState<Id<'tickets'> | null>(null);
    const [showAddTicket, setShowAddTicket] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState<Doc<"tickets"> | null>(null);
    const [ticketToDelete, setTicketToDelete] = useState<Doc<"tickets"> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const deleteTicket = useMutation(api.tickets.remove);

    const handleDelete = async (ticketId: Id<"tickets">) => {
        try {
            setError(null);
            await deleteTicket({ id: ticketId });
            setTicketToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete ticket");
        }
    };

    const handleTicketClick = (ticket: Doc<"tickets">) => {
        setShowViewTicket(null);
        setTicketToEdit(ticket);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Tickets</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "grid"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "list"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            List
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddTicket(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Ticket
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {viewMode === "grid" ? (
                <TicketGrid onTicketClick={handleTicketClick} setShowViewTicket={setShowViewTicket} />
            ) : (
                <TicketList
                    onEditTicket={handleTicketClick}
                    onViewTicket={(ticket) => setShowViewTicket(ticket._id)}
                />
            )}
            {showViewTicket && tickets?.find(t => t._id === showViewTicket) && (
                <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-4xl">
                        <ViewTicket
                            ticketId={showViewTicket}
                            onEdit={handleTicketClick}
                            onClose={() => setShowViewTicket(null)}
                        />
                    </div>
                </div>
            )}
            {showAddTicket && <AddTicket onClose={() => setShowAddTicket(false)} />}
            {ticketToEdit && <EditTicket ticket={ticketToEdit} onClose={() => setTicketToEdit(null)} />}
            <ConfirmationModal
                isOpen={!!ticketToDelete}
                title="Delete Ticket"
                message={`Are you sure you want to delete "${ticketToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => ticketToDelete && handleDelete(ticketToDelete._id)}
                onCancel={() => setTicketToDelete(null)}
                variant="danger"
            />
        </div>
    );
};