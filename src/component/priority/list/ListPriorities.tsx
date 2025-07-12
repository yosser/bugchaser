import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { EditPriority } from "../edit";
import { AddPriority } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListPriorities: React.FunctionComponent = () => {
    const [priorityToEdit, setPriorityToEdit] = useState<Doc<"priority"> | null>(null);
    const [showAddPriority, setShowAddPriority] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [priorityToDelete, setPriorityToDelete] = useState<Doc<"priority"> | null>(null);
    const updatePriority = useMutation(api.priority.update);
    const deletePriority = useMutation(api.priority.remove);
    const prioritys = useQuery(api.priority.get);


    const handleDelete = async (priorityId: Id<"priority">) => {
        try {
            setError(null);
            await deletePriority({ id: priorityId });
            setPriorityToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete priority");
        }
    };

    const retirePriority = async (priority: Doc<"priority">) => {
        try {
            setError(null);
            await updatePriority({ id: priority._id, isDeleted: !priority.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire priority");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Prioritys</h2>
                <button
                    onClick={() => setShowAddPriority(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Priority
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
                        {(prioritys ?? []).map((priority) => (
                            <tr key={priority._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {priority.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {priority.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {priority.value}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        <input
                                            type="color"
                                            id="color"
                                            name="color"
                                            value={priority.colour}
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
                                            value={priority.textColour}
                                            disabled
                                            className="w-12 h-12 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {priority.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setPriorityToEdit(priority)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retirePriority(priority)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {priority.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setPriorityToDelete(priority)}
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
            {priorityToEdit && <EditPriority priority={priorityToEdit} onClose={() => setPriorityToEdit(null)} />}
            {showAddPriority && <AddPriority onClose={() => setShowAddPriority(false)} />}
            <ConfirmationModal
                isOpen={!!priorityToDelete}
                title="Delete Priority"
                message={`Are you sure you want to delete ${priorityToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => priorityToDelete && handleDelete(priorityToDelete._id)}
                onCancel={() => setPriorityToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
