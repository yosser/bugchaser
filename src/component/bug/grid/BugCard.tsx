import { useState } from "react";
import { useDrag } from "react-dnd";
import { useQuery } from "convex/react";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { AddComment } from "../../comment/add";
import { api } from "../../../../convex/_generated/api";
import { useDragRef } from "../../../hooks/hooks";
import { DateTime } from "luxon";
import { Comment } from "./Comment";

interface BugCardProps {
    bug: Doc<"bugs">;
    onEdit?: (bug: Doc<"bugs">) => void;
    setShowViewBug?: (bugId: Id<"bugs">) => void;
}

export const BugCard = ({ bug, onEdit, setShowViewBug }: BugCardProps) => {
    const [showAddComment, setShowAddComment] = useState(false);
    const [replyToComment, setReplyToComment] = useState<Doc<"comments"> | null>(null);

    const users = useQuery(api.users.get) ?? [];
    const statuses = useQuery(api.status.get) ?? [];
    const priorities = useQuery(api.priority.get) ?? [];
    const comments = useQuery(api.comments.get) ?? [];
    const assignedUser = users?.find(user => user._id === bug.assignedTo);
    const reporter = users?.find(user => user._id === bug.reporter);
    const status = statuses.find(s => s._id === bug.status);
    const priority = priorities.find(p => p._id === bug.priority);
    const [showComments, setShowComments] = useState(false);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'BUG',
        item: { id: bug._id, priority: bug.priority },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    const handleDragRef = useDragRef(drag);

    const getStatusColour = (statusId: Id<"status">) => {
        const statusValue = statuses.find(s => s._id === statusId)?.value;
        switch (statusValue) {
            case 1:
                return 'bg-green-100 text-green-800';
            case 2:
                return 'bg-blue-100 text-blue-800';
            case 3:
                return 'bg-light-blue-100 text-light-blue-800';
            case 4:
                return 'bg-red-100 text-red-800';
            case 5:
                return 'bg-light-green-100 text-light-green-800';
            default:
                return 'bg-gret-100 text-grey800';
        }
    };

    const getPriorityColour = (priorityId: Id<"priority">) => {
        const priorityValue = priorities.find(p => p._id === priorityId)?.value;
        switch (priorityValue) {
            case 5:
                return 'bg-red-100 text-red-800';
            case 4:
                return 'bg-orange-100 text-orange-800';
            case 3:
                return 'bg-yellow-100 text-yellow-800';
            case 2:
                return 'bg-light-green-100 text-light-green-800';
            case 1:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const rootComments = comments.filter(c => c.bug === bug._id && !c.parentComment && !c.isDeleted);

    const handleReply = (comment: Doc<"comments">) => {
        setReplyToComment(comment);
        setShowAddComment(true);
    };

    const handleCloseComment = () => {
        setShowAddComment(false);
        setReplyToComment(null);
    };

    return (
        <>
            <div
                ref={handleDragRef}
                className={`bg-white rounded-lg shadow p-4 mb-2 cursor-move ${isDragging ? 'opacity-50' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{bug.title}</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowViewBug?.(bug._id)}
                            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            title="View Details"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => onEdit?.(bug)}
                                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bug.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColour(bug.status)}`}>
                        {status?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColour(bug.priority)}`}>
                        {priority?.name}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <span>Assigned to: {assignedUser?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span>Reporter: {reporter?.name}</span>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none flex items-center space-x-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.014 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                            </svg>
                            <span>
                                {rootComments.length} {rootComments.length === 1 ? 'Comment' : 'Comments'}
                            </span>
                        </button>
                        <button
                            onClick={() => setShowAddComment(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none flex items-center space-x-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>Add Comment</span>
                        </button>
                    </div>
                    {showComments && rootComments.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {rootComments.map((comment) => (
                                <Comment
                                    key={comment._id}
                                    comment={comment}
                                    users={users}
                                    onReply={handleReply}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <span>Created: {bug.createdAt ? DateTime.fromMillis(bug.createdAt).toRelative() : 'N/A'}</span>
                    <span>Updated: {bug.updatedAt ? DateTime.fromMillis(bug.updatedAt).toRelative() : 'N/A'}</span>
                </div>
            </div>
            {showAddComment && (
                <AddComment
                    onClose={handleCloseComment}
                    bugId={bug._id}
                    parentComment={replyToComment ?? undefined}
                />
            )}

        </>
    );
}; 