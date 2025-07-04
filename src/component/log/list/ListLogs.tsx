import { useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";
import type { Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";

export const ListLogs = () => {
    const { currentProject, currentEpic } = useContext(UserContext);
    const users = useQuery(api.users.get);
    const tickets = useQuery(api.tickets.getByProjectEpic, { projectId: currentProject?._id ?? undefined, epicId: currentEpic?._id ?? undefined });
    const comments = useQuery(api.comments.get);
    const [logView, setLogView] = useState<'ticket' | 'comment' | 'user' | ''>('');
    const [filter, setFilter] = useState<Id<'tickets'> | Id<'comments'> | Id<'users'> | ''>('');
    const logs = useQuery(api.logs.getFiltered, {
        ticketId: (logView === 'ticket' && filter !== '') ? filter as Id<'tickets'> : undefined,
        commentId: (logView === 'comment' && filter !== '') ? filter as Id<'comments'> : undefined,
        userId: (logView === 'user' && filter !== '') ? filter as Id<'users'> : undefined,
    });

    useEffect(() => {
        if (logView === '') {
            setFilter('');
        }
    }, [logView])

    const getUserName = (userId: string | undefined) => {
        if (!userId) return "System";
        return users?.find(user => user._id === userId)?.name || "Unknown User";
    };

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };

    const getLogOptions = (): { label: string, value: Id<'tickets'> | Id<'comments'> | Id<'users'> }[] => {
        if (logView === 'ticket') {
            return (tickets ?? []).map(ticket => ({ label: ticket.title, value: ticket._id }));
        } else if (logView === 'comment') {
            return (comments ?? []).map(comment => ({ label: comment.text, value: comment._id }));
        } else if (logView === 'user') {
            return (users ?? []).map(user => ({ label: user.name, value: user._id }));
        }
        return [];
    };

    const onSetLogView = (view: 'ticket' | 'comment' | 'user' | '') => {
        if (view === logView) {
            setLogView('');
            setFilter('');
        } else {
            setLogView(view);
            if (view === 'ticket') {
                setFilter(tickets?.[0]?._id ?? '');
            } else if (view === 'comment') {
                setFilter(comments?.[0]?._id ?? '');
            } else if (view === 'user') {
                setFilter(users?.[0]?._id ?? '');
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
            </div>

            <div className="flex items-center justify-end space-x-2 bg-white p-4 rounded-lg shadow-sm mb-6">
                <span className="text-sm font-medium text-gray-700">View by:</span>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">

                    {logView !== '' && <select value={filter} onChange={(e) => setFilter(e.target.value as Id<'tickets'> | Id<'comments'> | Id<'users'> | "")} className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors">
                        {getLogOptions().map(option => (
                            <option key={option.value.toString()} value={option.value}>{option.label}</option>
                        ))}

                    </select>}

                    <button
                        onClick={() => onSetLogView('ticket')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${logView === 'ticket'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Ticket
                    </button>
                    <button
                        onClick={() => onSetLogView('comment')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${logView === 'comment'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Comment
                    </button>
                    <button
                        onClick={() => onSetLogView('user')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${logView === 'user'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Assigned To
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Related Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Timestamp
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {logs?.filter(log => logView === 'ticket' ? log.ticket : logView === 'comment' ? log.comment : logView === 'user' ? log.user : true).map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {getUserName(log.user)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {log.action}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {log.ticket ? `Ticket: ${tickets?.find(ticket => ticket._id === log.ticket)?.title}` : log.comment ? `Comment: ${comments?.find(comment => comment._id === log.comment)?.text}` : "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(log.createdAt)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
