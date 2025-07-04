import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { DateTime } from "luxon";
import { EditLocation } from "../edit";
import { AddLocation } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListLocations: React.FunctionComponent = () => {
    const [locationToEdit, setLocationToEdit] = useState<Doc<"locations"> | null>(null);
    const [showAddLocation, setShowAddLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationToDelete, setLocationToDelete] = useState<Doc<"locations"> | null>(null);
    const updateLocation = useMutation(api.locations.update);
    const deleteLocation = useMutation(api.locations.remove);
    const locations = useQuery(api.locations.get);

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };
    const handleDelete = async (locationId: Id<"locations">) => {
        try {
            setError(null);
            await deleteLocation({ id: locationId });
            setLocationToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete location");
        }
    };

    const retireLocation = async (location: Doc<"locations">) => {
        try {
            setError(null);
            await updateLocation({ id: location._id, isDeleted: !location.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire location");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Locations</h2>
                <button
                    onClick={() => setShowAddLocation(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Location
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
                        {(locations ?? []).map((location) => (
                            <tr key={location._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {location.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {location.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(location.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(location.updatedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {location.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setLocationToEdit(location)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireLocation(location)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {location.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setLocationToDelete(location)}
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
            {locationToEdit && <EditLocation location={locationToEdit} onClose={() => setLocationToEdit(null)} />}
            {showAddLocation && <AddLocation onClose={() => setShowAddLocation(false)} />}
            <ConfirmationModal
                isOpen={!!locationToDelete}
                title="Delete Location"
                message={`Are you sure you want to delete ${locationToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => locationToDelete && handleDelete(locationToDelete._id)}
                onCancel={() => setLocationToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
