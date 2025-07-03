import { useContext, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

interface EditTicketProps {
    ticket: Doc<"tickets">;
    onClose: () => void;
}

export const EditTicket = ({ ticket, onClose }: EditTicketProps) => {
    const { currentUser } = useContext<IUserContext>(UserContext);
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const ticketTypes = useQuery(api.ticketType.get);
    const tags = useQuery(api.tags.get);
    const ticketTags = useQuery(api.ticketsTags.getByTicket, { ticketId: ticket._id });

    const [formData, setFormData] = useState({
        title: ticket.title,
        description: ticket.description ?? '',
        status: ticket.status,
        priority: ticket.priority,
        type: ticket.type,
        reporter: ticket.reporter,
        assignedTo: ticket.assignedTo,
        dueDate: ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : '',
    });

    const [selectedTags, setSelectedTags] = useState<Id<"tags">[]>(
        ticketTags?.map(tt => tt.tag) ?? []
    );

    const updateTicket = useMutation(api.tickets.update);
    const createLog = useMutation(api.logs.create);
    const createTicketTag = useMutation(api.ticketsTags.create);
    const removeTicketTag = useMutation(api.ticketsTags.remove);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateTicket({
                id: ticket._id,
                ...formData,
                dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
            });

            // Handle tag changes
            const currentTags = ticketTags?.map(bt => bt.tag) ?? [];
            const tagsToAdd = selectedTags.filter(tagId => !currentTags.includes(tagId));
            const tagsToRemove = ticketTags?.filter(bt => !selectedTags.includes(bt.tag)) ?? [];

            // Add new tags
            for (const tagId of tagsToAdd) {
                await createTicketTag({
                    ticketId: ticket._id,
                    tagId,
                });
            }

            // Remove tags
            for (const ticketTag of tagsToRemove) {
                await removeTicketTag({
                    id: ticketTag._id,
                });
            }

            await createLog({
                action: "Ticket updated",
                user: currentUser?._id,
                ticket: ticket._id,
            });
            onClose();
        } catch (error) {
            console.error("Failed to update ticket:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTagChange = (tagId: Id<"tags">) => {
        setSelectedTags(prev => {
            if (prev.includes(tagId)) {
                return prev.filter(id => id !== tagId);
            } else {
                return [...prev, tagId];
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Edit Ticket</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >{ticketTypes?.map((type) => (
                            <option key={type._id} value={type._id}>
                                {type.name}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {statuses?.map((status) => (
                                <option key={status._id} value={status._id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {priorities?.map((priority) => (
                                <option key={priority._id} value={priority._id}>
                                    {priority.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned To
                        </label>
                        <select
                            id="assignedTo"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {users?.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <div className="space-y-2">
                            {tags?.map((tag) => (
                                <label key={tag._id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag._id)}
                                        onChange={() => handleTagChange(tag._id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="flex items-center">
                                        <span
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: tag.color ?? '#3B82F6' }}
                                        />
                                        {tag.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

