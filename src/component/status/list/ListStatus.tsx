import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { EditStatus } from "../edit";
import { AddStatus } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListStatus: React.FunctionComponent = () => {
    const [statusToEdit, setStatusToEdit] = useState<Doc<"status"> | null>(null);
    const [showAddStatus, setShowAddStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusToDelete, setStatusToDelete] = useState<Doc<"status"> | null>(null);
    const updateStatus = useMutation(api.status.update);
    const deleteStatus = useMutation(api.status.remove);
    const statuss = useQuery(api.status.get);


    const handleDelete = async (statusId: Id<"status">) => {
        try {
            setError(null);
            await deleteStatus({ id: statusId });
            setStatusToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete status");
        }
    };

    const retireStatus = async (status: Doc<"status">) => {
        try {
            setError(null);
            await updateStatus({ id: status._id, isDeleted: !status.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire status");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Statuss</h2>
                <button
                    onClick={() => setShowAddStatus(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Status
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
                        {(statuss ?? []).map((status) => (
                            <tr key={status._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {status.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {status.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {status.value}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        <input
                                            type="color"
                                            id="color"
                                            name="color"
                                            value={status.colour}
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
                                            value={status.textColour}
                                            disabled
                                            className="w-12 h-12 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {status.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setStatusToEdit(status)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireStatus(status)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {status.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setStatusToDelete(status)}
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
            {statusToEdit && <EditStatus status={statusToEdit} onClose={() => setStatusToEdit(null)} />}
            {showAddStatus && <AddStatus onClose={() => setShowAddStatus(false)} />}
            <ConfirmationModal
                isOpen={!!statusToDelete}
                title="Delete Status"
                message={`Are you sure you want to delete ${statusToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => statusToDelete && handleDelete(statusToDelete._id)}
                onCancel={() => setStatusToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
