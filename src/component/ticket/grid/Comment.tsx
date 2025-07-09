import { useContext, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";
import { useAppDispatch as useDispatch } from "../../../hooks";
import { addToast } from "../../../store";
import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";

interface CommentProps {
    comment: Doc<"comments">;
    users: Doc<"users">[];
    level?: number;
    onReply?: (comment: Doc<"comments">) => void;
}

export const Comment = ({ comment, users, level = 0, onReply }: CommentProps) => {
    const dispatch = useDispatch();
    const { currentUser } = useContext<IUserContext>(UserContext);
    const user = users.find(u => u._id === comment.user);
    const replies = useQuery(api.comments.get)?.filter(c => c.parentComment === comment._id && !c.isDeleted) ?? [];
    const [showReplies, setShowReplies] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.text);
    const updateComment = useMutation(api.comments.update);
    const createLog = useMutation(api.logs.create);

    const handleEdit = async () => {
        if (editedText.trim() === '') {
            return;
        }
        try {
            await updateComment({
                id: comment._id,
                text: editedText,
                isEdited: true,
            });

            await createLog({
                action: "Comment edited",
                user: currentUser?._id,
                ticket: comment.ticket,
                comment: comment._id,
            });
            dispatch(addToast("Comment updated"));
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update comment:", error);
        }
    };

    const handleCancel = () => {
        setEditedText(comment.text);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEdit();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className={`mt-2 ${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-sm">{user?.name || 'Unknown User'}</span>
                        <span className="text-sm text-gray-500">
                            {comment.createdAt ? DateTime.fromMillis(comment.createdAt).toRelative() : 'Unknown time'}
                        </span>
                        {comment.isEdited && (
                            <span className="text-xs text-gray-500">(edited)</span>
                        )}
                    </div>
                </div>
                {isEditing ? (
                    <div className="mt-1">
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            onKeyDown={handleKeyDown}

                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            autoFocus
                        />
                        <div className="mt-2 flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="text-sm text-gray-600 hover:text-gray-700 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <p
                        className="mt-1 text-gray-700 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 text-sm"
                        onClick={() => setIsEditing(true)}
                    >
                        {comment.text}
                    </p>
                )}
                {onReply && (
                    <div className="mt-2 flex items-center space-x-3">
                        <button
                            onClick={() => onReply(comment)}
                            className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none flex items-center space-x-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Reply</span>
                        </button>
                    </div>
                )}
            </div>
            {replies.length > 0 && (
                <div className="mt-2">
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                    >
                        {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                    {showReplies && (
                        <div className="mt-2">
                            {replies.map((reply) => (
                                <Comment
                                    key={reply._id}
                                    comment={reply}
                                    users={users}
                                    level={level + 1}
                                    onReply={onReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
