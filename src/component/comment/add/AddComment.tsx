import { useState, useContext } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

interface AddCommentProps {
    onClose: () => void;
    bugId?: Id<"bugs">;
    parentCommentId?: Id<"comments">;
}

export const AddComment = ({ onClose, bugId, parentCommentId }: AddCommentProps) => {
    const { currentUser } = useContext<IUserContext>(UserContext);
    const createComment = useMutation(api.comments.create);
    const [formData, setFormData] = useState({
        text: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            return;
        }

        try {
            await createComment({
                text: formData.text,
                bug: bugId,
                user: currentUser._id,
                parentComment: parentCommentId,
                isReply: !!parentCommentId,
            });
            onClose();
        } catch (error) {
            console.error("Failed to create comment:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">
                    {parentCommentId ? "Add Reply" : "Add Comment"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                            {parentCommentId ? "Reply" : "Comment"}
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={parentCommentId ? "Write your reply..." : "Write your comment..."}
                            required
                        />
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
                            {parentCommentId ? "Post Reply" : "Post Comment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 