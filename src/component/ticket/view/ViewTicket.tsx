import { useState } from "react";
import { useQuery } from "convex/react";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";
import { Comment } from "../grid/Comment";

interface ViewTicketProps {
    ticketId: Id<"tickets">;
    onEdit?: (ticket: Doc<"tickets">) => void;
    onClose?: () => void;
}

export const ViewTicket: React.FunctionComponent<ViewTicketProps> = ({ ticketId, onEdit, onClose }) => {
    const ticket = useQuery(api.tickets.getById, { id: ticketId });
    const users = useQuery(api.users.get) ?? [];
    const statuses = useQuery(api.status.get) ?? [];
    const priorities = useQuery(api.priority.get) ?? [];
    const epics = useQuery(api.epics.get) ?? [];
    const ticketTypes = useQuery(api.ticketType.get) ?? [];
    const comments = useQuery(api.comments.getByTicket, { ticketId }) ?? [];
    const logs = useQuery(api.logs.get) ?? [];
    const ticketTags = useQuery(api.ticketsTags.getByTicket, { ticketId }) ?? [];
    const tags = useQuery(api.tags.get) ?? [];

    const assignedUser = users?.find(user => user._id === ticket?.assignedTo);
    const reporter = users?.find(user => user._id === ticket?.reporter);
    const status = statuses.find(s => s._id === ticket?.status);
    const priority = priorities.find(p => p._id === ticket?.priority);
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

    const rootComments = comments.filter(c => !c.parentComment && !c.isDeleted);

    const ticketLogs = logs
        .filter(log => log.ticket === ticketId)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

    const getActionIcon = (action: string) => {
        switch (action.toLowerCase()) {
            case 'created':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'updated':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                );
            case 'commented':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.014 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                    </svg>
                );
            case 'status changed':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
            case 'assigned':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                );
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (!ticket) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{ticket.title}</h2>
                    <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-md font-medium `}>
                            {epics.find(e => e._id === ticket.epic)?.name}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-3">
                    {onEdit && (
                        <button
                            onClick={() => onEdit(ticket)}
                            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-2"
                            title="Edit Ticket"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                    )}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-2"
                            title="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="col-span-2 space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none flex items-center space-x-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.014 3 10c0-4.418 4.03-8 9-8s9 3.582 9 8zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" />
                                </svg>
                                <span>
                                    {rootComments.length} {rootComments.length === 1 ? 'Comment' : 'Comments'}
                                </span>
                            </button>
                        </div>

                        {showComments && rootComments.length > 0 && (
                            <div className="space-y-4">
                                {rootComments.map((comment) => (
                                    <Comment
                                        key={comment._id}
                                        comment={comment}
                                        users={users}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
                                <p className="mt-1 text-gray-900">{assignedUser?.name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Reporter</h4>
                                <p className="mt-1 text-gray-900">{reporter?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Created</h4>
                                <p className="mt-1 text-gray-900 text-xs">
                                    {ticket.createdAt ? DateTime.fromMillis(ticket.createdAt).toFormat('MMM d, yyyy h:mm a') : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                                <p className="mt-1 text-gray-900 text-xs">
                                    {ticket.updatedAt ? DateTime.fromMillis(ticket.updatedAt).toFormat('MMM d, yyyy h:mm a') : 'N/A'}
                                </p>
                            </div>
                            {ticket.dueDate && <div>
                                <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                                <p className="mt-1 text-gray-900 text-xs">
                                    {ticket.dueDate ? DateTime.fromMillis(ticket.dueDate).toFormat('MMM d, yyyy h:mm a') : 'N/A'}
                                </p>
                            </div>}
                            <div className="flex items-center space-x-2">
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColour(ticket.status)}`}>
                                        {status?.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Priority</h4>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColour(ticket.priority)}`}>
                                        {priority?.name}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Type</h4>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800`}>
                                        {ticketTypes.find(t => t._id === ticket.type)?.name}
                                    </span>
                                </div>
                            </div>
                            <div>

                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {ticketTags.map(ticketTag => {
                                        const tag = tags.find(t => t._id === ticketTag.tag);
                                        if (!tag) return null;
                                        return (
                                            <span
                                                key={ticketTag._id}
                                                className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 flex items-center"
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
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h3>
                        <div className="space-y-4">
                            {ticketLogs.length > 0 ? (
                                ticketLogs.map((log) => (
                                    <div key={log._id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900">
                                                <span className="font-medium">
                                                    {users.find(u => u._id === log.user)?.name || 'Unknown User'}
                                                </span>
                                                {' '}{log.action.toLowerCase()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {log.createdAt ? DateTime.fromMillis(log.createdAt).toFormat('MMM d, yyyy h:mm a') : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No activity recorded</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Issues</h3>
                        <p className="text-gray-500 text-sm">Related issues will be shown here</p>
                    </div>
                </div>
            </div>
        </div>
    );
}; 