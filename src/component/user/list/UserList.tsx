import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AddUser } from "../add/AddUser";
import { EditUser } from "../edit/EditUser";
import { ManageUserProjects } from "../project/ManageUserProjects";

export const UserList = () => {
    const users = useQuery(api.users.get);
    const roles = useQuery(api.roles.get);
    const removeUser = useMutation(api.users.remove);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Doc<"users"> | null>(null);
    const [managingProjectsFor, setManagingProjectsFor] = useState<Id<"users"> | null>(null);

    const handleDelete = async (id: Id<"users">) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await removeUser({ id });
            } catch (error) {
                console.error("Failed to delete user:", error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add User
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users?.map((user) => (
                            <tr key={user._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{roles?.find(r => r._id === user.role)?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setManagingProjectsFor(user._id)}
                                        className="text-green-600 hover:text-green-900 mr-4"
                                    >
                                        Projects
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user._id)}
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
                <AddUser onClose={() => setIsAddModalOpen(false)} />
            )}

            {editingUser && (
                <EditUser
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                />
            )}

            {managingProjectsFor && (
                <ManageUserProjects
                    userId={managingProjectsFor}
                    onClose={() => setManagingProjectsFor(null)}
                />
            )}
        </div>
    );
}; 