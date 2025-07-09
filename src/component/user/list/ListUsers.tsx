import { useState, useContext } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useAppDispatch as useDispatch } from "../../../hooks";
import { addToast } from "../../../store";
import { EditUser } from "../edit";
import { AddUser } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

export const ListUsers = () => {
    const dispatch = useDispatch();
    const { currentUser } = useContext<IUserContext>(UserContext);
    const users = useQuery(api.users.get);
    const roles = useQuery(api.roles.get);
    const [userToEdit, setUserToEdit] = useState<Doc<"users"> | null>(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<Doc<"users"> | null>(null);
    const deleteUser = useMutation(api.users.remove);
    const createLog = useMutation(api.logs.create);

    const handleDelete = async (userId: Id<"users">) => {
        try {
            setError(null);
            await deleteUser({ id: userId });
            await createLog({
                action: `User deleted ${userToDelete?.name}`,
                user: currentUser?._id,
            });
            setUserToDelete(null);
            dispatch(addToast("User deleted"));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete user");
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Users</h2>
                <button
                    onClick={() => setShowAddUser(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add User
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {users?.map((user) => (
                    <div key={user._id} className="grid grid-cols-4 p-3 bg-white rounded-lg shadow">
                        <span className="font-medium justify-self-start">{user._id === currentUser?._id ? <span className="text-blue-500">{user.name}</span> : user.name}</span>
                        <span className="font-medium justify-self-center">{roles?.find(role => role._id === user.role)?.name}</span>
                        <span className="font-medium justify-self-left">{user.email}</span>
                        <div className="flex space-x-2 justify-self-end">
                            <button
                                onClick={() => setUserToEdit(user)}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setUserToDelete(user)}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {userToEdit && <EditUser user={userToEdit} onClose={() => setUserToEdit(null)} />}
            {showAddUser && <AddUser onClose={() => setShowAddUser(false)} />}
            <ConfirmationModal
                isOpen={!!userToDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => userToDelete && handleDelete(userToDelete._id)}
                onCancel={() => setUserToDelete(null)}
                variant="danger"
            />
        </div>
    );
};