import { useState, useContext } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { AddBug } from "../add/AddBug";

import { UserContext } from "../../../context/userContext";

interface BugListProps {
    onViewBug: (bug: Doc<"bugs">) => void;
    onEditBug: (bug: Doc<"bugs">) => void;
}

export const BugList: React.FunctionComponent<BugListProps> = ({ onViewBug, onEditBug }) => {
    const { currentProject } = useContext(UserContext);
    const bugs = useQuery(api.bugs.getByProject, { projectId: currentProject?._id });
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const removeBug = useMutation(api.bugs.remove);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    if (!currentProject) {
        return <div className="p-4 text-gray-500">Please select a project to view bugs.</div>;
    }

    const handleDelete = async (id: Id<"bugs">) => {
        if (window.confirm("Are you sure you want to delete this bug?")) {
            try {
                await removeBug({ id });
            } catch (error) {
                console.error("Failed to delete bug:", error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bugs</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Bug
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
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
                        {bugs?.map((bug) => (
                            <tr key={bug._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{bug.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{statuses?.find(s => s._id === bug.status)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{priorities?.find(p => p._id === bug.priority)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{users?.find(u => u._id === bug.assignedTo)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onViewBug(bug)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => onEditBug(bug)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bug._id)}
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
                <AddBug onClose={() => setIsAddModalOpen(false)} />
            )}


        </div>
    );
}; 