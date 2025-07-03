import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { EditComment } from "../edit";
import { AddComment } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";

interface ListCommentsProps {
    ticketId?: Id<"tickets">;
}

export const ListComments = ({ ticketId }: ListCommentsProps) => {
    const comments = useQuery(api.comments.get);
    const tickets = useQuery(api.tickets.get);
    const users = useQuery(api.users.get);
    const [commentToEdit, setCommentToEdit] = useState<Doc<"comments"> | null>(null);
    const [showAddComment, setShowAddComment] = useState(false);
    const [parentComment, setParentComment] = useState<Doc<"comments"> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<Doc<"comments"> | null>(null);
    const deleteComment = useMutation(api.comments.remove);

    const handleDelete = async (commentId: Id<"comments">) => {
        try {
            setError(null);
            await deleteComment({ id: commentId });
            setCommentToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete comment");
        }
    };

    const onShowReplyForm = (comment: Doc<"comments">) => {
        setParentComment(comment);
        setShowAddComment(true);
    };

    const ticketComments = comments?.filter(comment => ticketId ? comment.ticket === ticketId && !comment.parentComment : !comment.parentComment) || [];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Comments</h2>
                <button
                    onClick={() => setShowAddComment(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Comment
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {ticketComments.map((comment) => {
                    const commentUser = users?.find(user => user._id === comment.user);
                    const replies = comments?.filter(reply => reply.parentComment === comment._id) || [];

                    return (
                        <div key={comment._id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-medium text-gray-900">
                                        {commentUser?.name || "Unknown User"}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {tickets?.find(ticket => ticket._id === comment.ticket)?.title || "N/A"}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCommentToEdit(comment)}
                                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setCommentToDelete(comment)}
                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">{comment.text}</p>

                            {/* Replies */}
                            {replies.length > 0 && (
                                <div className="ml-8 space-y-3 mt-4">
                                    {replies.map((reply) => {
                                        const replyUser = users?.find(user => user._id === reply.user);
                                        return (
                                            <div key={reply._id} className="bg-gray-50 rounded-lg p-3">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {replyUser?.name || "Unknown User"}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setCommentToEdit(reply)}
                                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setCommentToDelete(reply)}
                                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">{reply.text}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Reply button */}
                            <button
                                onClick={() => onShowReplyForm(comment)}
                                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                Reply
                            </button>
                        </div>
                    );
                })}
            </div>

            {commentToEdit && <EditComment comment={commentToEdit} onClose={() => setCommentToEdit(null)} />}
            {showAddComment && <AddComment onClose={() => setShowAddComment(false)} ticketId={ticketId} parentComment={parentComment ?? undefined} />}
            <ConfirmationModal
                isOpen={!!commentToDelete}
                title="Delete Comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                onConfirm={() => commentToDelete && handleDelete(commentToDelete._id)}
                onCancel={() => setCommentToDelete(null)}
                variant="danger"
            />
        </div>
    );
}; 