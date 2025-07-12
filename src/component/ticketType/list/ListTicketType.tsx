import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { EditTicketType } from "../edit";
import { AddTicketType } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListTicketType: React.FunctionComponent = () => {
    const [ticketTypeToEdit, setTicketTypeToEdit] = useState<Doc<"ticketType"> | null>(null);
    const [showAddTicketType, setShowAddTicketType] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ticketTypeToDelete, setTicketTypeToDelete] = useState<Doc<"ticketType"> | null>(null);
    const updateTicketType = useMutation(api.ticketType.update);
    const deleteTicketType = useMutation(api.ticketType.remove);
    const ticketTypes = useQuery(api.ticketType.get);


    const handleDelete = async (ticketTypeId: Id<"ticketType">) => {
        try {
            setError(null);
            await deleteTicketType({ id: ticketTypeId });
            setTicketTypeToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete ticketType");
        }
    };

    const retireTicketType = async (ticketType: Doc<"ticketType">) => {
        try {
            setError(null);
            await updateTicketType({ id: ticketType._id, isDeleted: !ticketType.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire ticketType");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">TicketTypes</h2>
                <button
                    onClick={() => setShowAddTicketType(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add TicketType
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Colour
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Text Colour
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Is deleted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(ticketTypes ?? []).map((ticketType) => (
                            <tr key={ticketType._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {ticketType.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {ticketType.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {ticketType.value}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        <input
                                            type="color"
                                            id="color"
                                            name="color"
                                            value={ticketType.colour}
                                            disabled
                                            className="w-12 h-12 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        <input
                                            type="color"
                                            id="color"
                                            name="color"
                                            value={ticketType.textColour}
                                            disabled
                                            className="w-12 h-12 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {ticketType.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setTicketTypeToEdit(ticketType)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireTicketType(ticketType)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {ticketType.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setTicketTypeToDelete(ticketType)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {ticketTypeToEdit && <EditTicketType ticketType={ticketTypeToEdit} onClose={() => setTicketTypeToEdit(null)} />}
            {showAddTicketType && <AddTicketType onClose={() => setShowAddTicketType(false)} />}
            <ConfirmationModal
                isOpen={!!ticketTypeToDelete}
                title="Delete TicketType"
                message={`Are you sure you want to delete ${ticketTypeToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => ticketTypeToDelete && handleDelete(ticketTypeToDelete._id)}
                onCancel={() => setTicketTypeToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
