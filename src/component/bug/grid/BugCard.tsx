import { useState } from "react";
import { useDrag } from "react-dnd";
import { useQuery } from "convex/react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { AddComment } from "../../comment/add";
import { api } from "../../../../convex/_generated/api";
import { useDragRef } from "../../../hooks/hooks";

interface BugCardProps {
    bug: Doc<"bugs">;
    onEdit?: (bug: Doc<"bugs">) => void;
}

export const BugCard = ({ bug, onEdit }: BugCardProps) => {
    const [showAddComment, setShowAddComment] = useState(false);
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
    const getStatusColor = (statusName: string) => {
        switch (statusName.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in progress':
                return 'bg-blue-100 text-blue-800';
            case 'closed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priorityName: string) => {
        switch (priorityName.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <div
                ref={handleDragRef}
                className={`bg-white rounded-lg shadow p-4 mb-2 cursor-move ${isDragging ? 'opacity-50' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{bug.title}</h3>

                    <button
                        onClick={() => setShowAddComment(true)}
                        className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.014 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onEdit?.(bug)}
                        className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                        Edit
                    </button>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bug.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bug.status)}`}>
                        {status?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(bug.priority)}`}>
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
                <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setShowComments(!showComments)}>Comments: {comments.filter(c => c.bug === bug._id && !c.isDeleted).length}</button>
                    </div>

                </div>
                {showComments ?
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        {comments.filter(c => c.bug === bug._id && !c.isDeleted).map((comment) => (
                            <div key={comment._id} className="flex items-center space-x-2">
                                <p>{comment.text}</p>
                                <p>{users?.find(u => u._id === comment.user)?.name}</p>
                            </div>
                        ))}
                    </div> : null}
                <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                    <span>Created: {bug.createdAt ? new Date(bug.createdAt).toLocaleString() : 'N/A'}</span>
                    <span>Updated: {bug.updatedAt ? new Date(bug.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
            </div>
            {showAddComment && (
                <AddComment
                    onClose={() => setShowAddComment(false)}
                    bugId={bug._id}
                />
            )}

        </>
    );
}; 