import { useState } from "react";
import { useQuery } from "convex/react";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { AddComment } from "../../comment/add";
import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";
import { Comment } from "./Comment";

interface TicketCardProps {
    ticket: Doc<"tickets">;
    onEdit?: (ticket: Doc<"tickets">) => void;
    setShowViewTicket?: (ticketId: Id<"tickets">) => void;
}

export const TicketCard = ({ ticket, onEdit, setShowViewTicket }: TicketCardProps) => {
    const [showAddComment, setShowAddComment] = useState(false);
    const [replyToComment, setReplyToComment] = useState<Doc<"comments"> | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const users = useQuery(api.users.get) ?? [];
    const statuses = useQuery(api.status.get) ?? [];
    const priorities = useQuery(api.priority.get) ?? [];
    const comments = useQuery(api.comments.getByTicket, { ticketId: ticket._id }) ?? [];
    const ticketTypes = useQuery(api.ticketType.get) ?? [];
    const ticketTags = useQuery(api.ticketsTags.getByTicket, { ticketId: ticket._id }) ?? [];
    const tags = useQuery(api.tags.get) ?? [];

    const assignedUser = users?.find(user => user._id === ticket.assignedTo);
    const reporter = users?.find(user => user._id === ticket.reporter);
    const status = statuses.find(s => s._id === ticket.status);
    const priority = priorities.find(p => p._id === ticket.priority);
    const [showComments, setShowComments] = useState(false);

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
                return 'bg-grey-100 text-grey-800';
        }
    };

    const getPriorityColour = (priorityId: Id<"priority">) => {
        const priorityValue = priorities.find(p => p._id === priorityId)?.value;
        switch (priorityValue) {
            case 1:
                return 'bg-red-100 text-red-800';
            case 2:
                return 'bg-orange-100 text-orange-800';
            case 3:
                return 'bg-yellow-100 text-yellow-800';
            case 4:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-grey-100 text-grey-800';
        }
    };

    const getCommentsForTicket = () => {
        return comments.filter(comment => comment.ticket === ticket._id && !comment.parentComment && !comment.isDeleted);
    };

    return (
        <>
            <div
                draggable={true}
                onDragStart={(e) => {
                    e.stopPropagation();
                    setIsDragging(true);
                    e.dataTransfer.dropEffect = 'move';
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('ticket', JSON.stringify(ticket));
                }}
                onDragEnd={(e) => {
                    setIsDragging(false);
                    e.dataTransfer.clearData();
                    e.stopPropagation();
                }}
                className={`bg-white rounded-lg shadow p-4 mb-2 cursor-move ${isDragging ? 'opacity-50' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowViewTicket?.(ticket._id)}
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
                                onClick={() => onEdit?.(ticket)}
                                className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColour(ticket.status)}`}>
                        {status?.name}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColour(ticket.priority)}`}>
                        {priority?.name}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800`}>
                        {ticketTypes.find(t => t._id === ticket.type)?.name}
                    </span>
                    {ticketTags.map(ticketTag => {
                        const tag = tags.find(t => t._id === ticketTag.tag);
                        if (!tag) return null;
                        return (
                            <span
                                key={ticketTag._id}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 flex items-center"
                                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                            >
                                <span
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                            </span>
                        );
                    })}
                </div>

                <div className="text-sm text-gray-600 mb-2">
                    <p>Assigned to: {assignedUser?.name}</p>
                    <p>Reported by: {reporter?.name}</p>
                </div>

                <div className="text-xs text-gray-500">
                    <p>Created: {DateTime.fromMillis(ticket.createdAt ?? 0).toRelative()}</p>
                    {ticket.updatedAt && (
                        <p>Updated: {DateTime.fromMillis(ticket.updatedAt).toRelative()}</p>
                    )}
                </div>

                <div className="mt-4">
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    >
                        {showComments ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    {showComments && (
                        <div className="mt-2 space-y-2">
                            {getCommentsForTicket().map((comment) => (
                                <Comment
                                    key={comment._id}
                                    comment={comment}
                                    users={users}
                                    onReply={() => {
                                        setReplyToComment(comment);
                                        setShowAddComment(true);
                                    }}
                                />
                            ))}
                            <button
                                onClick={() => setShowAddComment(true)}
                                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                Add Comment
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showAddComment && (
                <AddComment
                    ticketId={ticket._id}
                    onClose={() => {
                        setShowAddComment(false);
                        setReplyToComment(null);
                    }}
                    parentComment={replyToComment ?? undefined}
                />
            )}
        </>
    );
}; 