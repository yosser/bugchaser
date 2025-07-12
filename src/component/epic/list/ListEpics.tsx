import { useContext, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { DateTime } from "luxon";
import { UserContext } from "../../../context/userContext";
import { EditEpic } from "../edit/EditEpic";
import { AddEpic } from "../add/AddEpic";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


const Tickets: React.FC<{ projectId: Id<"projects"> | undefined, epicId: Id<"epics"> | undefined }> = ({ projectId, epicId }) => {
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId, epicId });
    return <div>
        <div className="text-sm text-gray-800">{tickets?.length} ticket{tickets?.length === 1 ? "" : "s"}</div>
        {tickets?.map(ticket => <div key={ticket._id}>{ticket.title}</div>)}
    </div>
}

export const ListEpics = () => {
    const { currentProject } = useContext(UserContext);
    const [epicToEdit, setEpicToEdit] = useState<Doc<"epics"> | null>(null);
    const [showAddEpic, setShowAddEpic] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [epicToDelete, setEpicToDelete] = useState<Doc<"epics"> | null>(null);
    const updateEpic = useMutation(api.epics.update);
    const deleteEpic = useMutation(api.epics.remove);
    const epics = useQuery(api.epics.get);

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };
    const handleDelete = async (epicId: Id<"epics">) => {
        try {
            setError(null);
            await deleteEpic({ id: epicId });
            setEpicToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete epic");
        }
    };

    const retireEpic = async (epic: Doc<"epics">) => {
        try {
            setError(null);
            await updateEpic({ id: epic._id, isDeleted: !epic.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire epic");
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Epics / Jobs {currentProject?.name}</h2>
                <button
                    onClick={() => setShowAddEpic(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Epic
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
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Is deleted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tickets
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(epics ?? []).map((epic) => (
                            <tr key={epic._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {epic.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {epic.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(epic.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(epic.updatedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {epic.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        <Tickets projectId={currentProject?._id ?? undefined} epicId={epic._id ?? undefined} />
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setEpicToEdit(epic)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireEpic(epic)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {epic.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setEpicToDelete(epic)}
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
            {epicToEdit && <EditEpic epic={epicToEdit} onClose={() => setEpicToEdit(null)} />}
            {showAddEpic && <AddEpic onClose={() => setShowAddEpic(false)} />}
            <ConfirmationModal
                isOpen={!!epicToDelete}
                title="Delete Epic"
                message={`Are you sure you want to delete ${epicToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => epicToDelete && handleDelete(epicToDelete._id)}
                onCancel={() => setEpicToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
