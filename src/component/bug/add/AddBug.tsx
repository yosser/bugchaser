import { useContext, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

interface AddBugProps {
    onClose: () => void;
}

export const AddBug = ({ onClose }: AddBugProps) => {
    const { currentUser } = useContext<IUserContext>(UserContext);
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const createBug = useMutation(api.bugs.create);
    const createLog = useMutation(api.logs.create);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: statuses?.[0]?._id ?? "" as Id<"status">,
        priority: priorities?.[3]?._id ?? "" as Id<"priority">,
        reporter: currentUser?._id ?? "" as Id<"users">,
        assignedTo: currentUser?._id ?? "" as Id<"users">,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.status || !formData.priority || !formData.reporter || !formData.assignedTo) {
            return;
        }
        try {
            const bugId = await createBug({
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                reporter: formData.reporter,
                assignedTo: formData.assignedTo,
            });
            if (bugId) {
                await createLog({
                    action: "Bug created",
                    user: currentUser?._id,
                    bug: bugId,
                });
            }
            onClose();
        } catch (error) {
            console.error("Failed to create bug:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-2xl font-semibold mb-4">Add Bug</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Status</option>
                            {statuses?.map((status) => (
                                <option key={status._id} value={status._id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Priority</option>
                            {priorities?.map((priority) => (
                                <option key={priority._id} value={priority._id}>
                                    {priority.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="reporter" className="block text-sm font-medium text-gray-700">Reporter</label>
                        <select
                            id="reporter"
                            name="reporter"
                            value={formData.reporter}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Reporter</option>
                            {users?.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
                        <select
                            id="assignedTo"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Assignee</option>
                            {users?.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Create Bug
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
