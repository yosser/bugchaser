import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { DateTime } from "luxon";

export const ListLogs = () => {
    const logs = useQuery(api.logs.get);
    const users = useQuery(api.users.get);
    const bugs = useQuery(api.bugs.get);
    const comments = useQuery(api.comments.get);

    const getUserName = (userId: string | undefined) => {
        if (!userId) return "System";
        return users?.find(user => user._id === userId)?.name || "Unknown User";
    };

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Activity Logs</h2>
            </div>

            <div className="space-y-2">
                {logs?.map((log) => (
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
