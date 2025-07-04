import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { DateTime } from "luxon";
import { EditQualification } from "../edit";
import { AddQualification } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListQualifications: React.FunctionComponent = () => {
    const [qualificationToEdit, setQualificationToEdit] = useState<Doc<"qualifications"> | null>(null);
    const [showAddQualification, setShowAddQualification] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [qualificationToDelete, setQualificationToDelete] = useState<Doc<"qualifications"> | null>(null);
    const updateQualification = useMutation(api.qualifications.update);
    const deleteQualification = useMutation(api.qualifications.remove);
    const qualifications = useQuery(api.qualifications.get);

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };
    const handleDelete = async (qualificationId: Id<"qualifications">) => {
        try {
            setError(null);
            await deleteQualification({ id: qualificationId });
            setQualificationToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete qualification");
        }
    };

    const retireQualification = async (qualification: Doc<"qualifications">) => {
        try {
            setError(null);
            await updateQualification({ id: qualification._id, isDeleted: !qualification.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire qualification");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Qualifications</h2>
                <button
                    onClick={() => setShowAddQualification(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Qualification
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
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(qualifications ?? []).map((qualification) => (
                            <tr key={qualification._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {qualification.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {qualification.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(qualification.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(qualification.updatedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {qualification.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setQualificationToEdit(qualification)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireQualification(qualification)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {qualification.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setQualificationToDelete(qualification)}
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
            {qualificationToEdit && <EditQualification qualification={qualificationToEdit} onClose={() => setQualificationToEdit(null)} />}
            {showAddQualification && <AddQualification onClose={() => setShowAddQualification(false)} />}
            <ConfirmationModal
                isOpen={!!qualificationToDelete}
                title="Delete Qualification"
                message={`Are you sure you want to delete ${qualificationToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => qualificationToDelete && handleDelete(qualificationToDelete._id)}
                onCancel={() => setQualificationToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
