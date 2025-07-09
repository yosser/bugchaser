import { useContext, useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAppDispatch as useDispatch } from "../../../hooks";
import { addToast } from "../../../store";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

interface EditCommentProps {
    comment: Doc<"comments">;
    onClose: () => void;
}

export const EditComment = ({ comment, onClose }: EditCommentProps) => {
    const dispatch = useDispatch();
    const { currentUser } = useContext<IUserContext>(UserContext);
    const [formData, setFormData] = useState({
        text: comment.text,
    });

    const updateComment = useMutation(api.comments.update);
    const createLog = useMutation(api.logs.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateComment({
                id: comment._id,
                ...formData,
                isEdited: true,
            });
            await createLog({
                action: "Comment edited",
                user: currentUser?._id,
                ticket: comment.ticket,
                comment: comment._id,
            });
            dispatch(addToast("Comment updated"));
            onClose();
        } catch (error) {
            console.error("Failed to update comment:", error);
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
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Edit Comment</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                            Comment
                        </label>
                        <textarea
                            id="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 