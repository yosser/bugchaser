import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";

interface BugListProps {
    onBugClick?: (bug: Doc<"bugs">) => void;
    onDeleteClick?: (bug: Doc<"bugs">) => void;
}

export const BugList = ({ onBugClick, onDeleteClick }: BugListProps) => {
    const bugs = useQuery(api.bugs.get);
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);

    if (!bugs || !users || !statuses || !priorities) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-2">
            {bugs.map((bug) => {
                const assignedUser = users.find(user => user._id === bug.assignedTo);
                const reporter = users.find(user => user._id === bug.reporter);
                const status = statuses.find(s => s._id === bug.status);
                const priority = priorities.find(p => p._id === bug.priority);

                return (
                    <div key={bug._id} className="grid grid-cols-6 p-3 bg-white rounded-lg shadow">
                        <span className="font-medium justify-self-start">{bug.title}</span>
                        <span className="font-medium justify-self-center">{status?.name}</span>
                        <span className="font-medium justify-self-center">{priority?.name}</span>
                        <span className="font-medium justify-self-center">{assignedUser?.name}</span>
                        <span className="font-medium justify-self-center">{reporter?.name}</span>
                        <div className="flex space-x-2 justify-self-end">
                            <button
                                onClick={() => onBugClick?.(bug)}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDeleteClick?.(bug)}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}; 