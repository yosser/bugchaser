import { useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";
import type { Id } from "../../../../convex/_generated/dataModel";
import { UserContext } from "../../../context/userContext";

export const ListLogs = () => {
    const { currentProject } = useContext(UserContext);
    const users = useQuery(api.users.get);
    const bugs = useQuery(api.bugs.getByProject, { projectId: currentProject?._id });
    const comments = useQuery(api.comments.get);
    const [logView, setLogView] = useState<'bug' | 'comment' | 'user' | ''>('');
    const [filter, setFilter] = useState<Id<'bugs'> | Id<'comments'> | Id<'users'> | ''>('');
    const logs = useQuery(api.logs.getFiltered, {
        bugId: (logView === 'bug' && filter !== '') ? filter as Id<'bugs'> : undefined,
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

    const getLogOptions = (): { label: string, value: Id<'bugs'> | Id<'comments'> | Id<'users'> }[] => {
        if (logView === 'bug') {
            return (bugs ?? []).map(bug => ({ label: bug.title, value: bug._id }));
        } else if (logView === 'comment') {
            return (comments ?? []).map(comment => ({ label: comment.text, value: comment._id }));
        } else if (logView === 'user') {
            return (users ?? []).map(user => ({ label: user.name, value: user._id }));
        }
        return [];
    };

    const onSetLogView = (view: 'bug' | 'comment' | 'user' | '') => {
        if (view === logView) {
            setLogView('');
            setFilter('');
        } else {
            setLogView(view);
            if (view === 'bug') {
                setFilter(bugs?.[0]?._id ?? '');
            } else if (view === 'comment') {
                setFilter(comments?.[0]?._id ?? '');
            } else if (view === 'user') {
                setFilter(users?.[0]?._id ?? '');
            }
        }
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Activity Logs</h2>
            </div>
            <div className="flex items-center justify-end space-x-2 bg-white p-4 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-700">View by:</span>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">

                    {logView !== '' && <select value={filter} onChange={(e) => setFilter(e.target.value as Id<'bugs'> | Id<'comments'> | Id<'users'> | "")} className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors">
                        {getLogOptions().map(option => (
                            <option key={option.value.toString()} value={option.value}>{option.label}</option>
                        ))}

                    </select>}

                    <button
                        onClick={() => onSetLogView('bug')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${logView === 'bug'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Bug
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
            <div className="space-y-2">
                {logs?.filter(log => logView === 'bug' ? log.bug : logView === 'comment' ? log.comment : logView === 'user' ? log.user : true).map((log) => (
                    <div key={log._id} className="grid grid-cols-4 p-3 bg-white rounded-lg shadow">
                        <span className="font-medium justify-self-start">
                            {getUserName(log.user)}
                        </span>
                        <span className="font-medium justify-self-center">
                            {log.action}
                        </span>
                        <span className="font-medium justify-self-left text-truncate">
                            {log.bug ? `Bug: ${bugs?.find(bug => bug._id === log.bug)?.title}` : log.comment ? `Comment: ${comments?.find(comment => comment._id === log.comment)?.text}` : "N/A"}
                        </span>
                        <span className="font-medium justify-self-end">
                            {formatTime(log.createdAt)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
