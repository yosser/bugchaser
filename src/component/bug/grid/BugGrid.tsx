import { useContext, useState, useRef } from "react";

import { useQuery, useMutation } from "convex/react";
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDragRef } from "../../../hooks/hooks";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { BugCard } from "./BugCard";

import { UserContext } from "../../../context/userContext";
import type { IUserContext } from "../../../context/userContext";


interface BugGridProps {
    onBugClick?: (bug: Doc<"bugs">) => void;
    setShowViewBug?: (bugId: Id<"bugs">) => void;
}

interface IAssignedToColumnProps {
    assignedTo: Doc<"users">;
    bugs: Doc<"bugs">[];
    onBugEdit?: (bug: Doc<"bugs">) => void;
    onDrop: (bugId: Id<"bugs">, assignedToId: Id<"users">) => void;
    setShowViewBug?: (bugId: Id<"bugs">) => void;
}

const AssignedToColumn = ({ assignedTo, bugs, onBugEdit, onDrop, setShowViewBug }: IAssignedToColumnProps) => {
    // const dropRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'BUG',
        drop: (item: { id: Id<"bugs"> }) => {
            onDrop(item.id, assignedTo._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const handleDropRef = useDragRef(drop);
    const columnBugs = bugs.filter(bug => bug.assignedTo === assignedTo._id);

    return (<div ref={handleDropRef}
        className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
            }`}
    >
        <h3 className="text-lg font-semibold mb-4">{assignedTo.name}</h3>
        <div className="space-y-4">
            {columnBugs.map((bug) => {
                return (
                    <BugCard
                        key={bug._id}
                        bug={bug}
                        onEdit={onBugEdit}
                        setShowViewBug={setShowViewBug}
                    />
                );
            })}
        </div>
    </div >
    );
};

interface IPriorityColumnProps {
    priority: Doc<"priority">;
    bugs: Doc<"bugs">[];
    onBugEdit?: (bug: Doc<"bugs">) => void;
    onDrop: (bugId: Id<"bugs">, priorityId: Id<"priority">) => void;
    setShowViewBug?: (bugId: Id<"bugs">) => void;
}

const PriorityColumn = ({ priority, bugs, onBugEdit, onDrop, setShowViewBug }: IPriorityColumnProps) => {
    const dropRef = useRef<HTMLDivElement>(null);
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'BUG',
        drop: (item: { id: Id<"bugs"> }) => {
            onDrop(item.id, priority._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    drop(dropRef);

    const columnBugs = bugs.filter(bug => bug.priority === priority._id);

    return (
        <div
            ref={dropRef}
            className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
                }`}
        >
            <h3 className="text-lg font-semibold mb-4">{priority.name}</h3>
            <div className="space-y-4">
                {columnBugs.map((bug) => {

                    return (
                        <BugCard
                            key={bug._id}
                            bug={bug}
                            onEdit={onBugEdit}
                            setShowViewBug={setShowViewBug}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface IStatusColumnProps {
    status: Doc<"status">;
    bugs: Doc<"bugs">[];
    onBugEdit?: (bug: Doc<"bugs">) => void;
    onDrop: (bugId: Id<"bugs">, statusId: Id<"status">) => void;
    setShowViewBug?: (bugId: Id<"bugs">) => void;
}

const StatusColumn = ({ status, bugs, onBugEdit, onDrop, setShowViewBug }: IStatusColumnProps) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'BUG',
        drop: (item: { id: Id<"bugs"> }) => {
            onDrop(item.id, status._id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));
    const handleDropRef = useDragRef(drop);

    const columnBugs = bugs.filter(bug => bug.status === status._id);

    return (
        <div
            ref={handleDropRef}
            className={`p-4 rounded-lg ${isOver ? 'bg-gray-100' : 'bg-gray-50'
                }`}
        >
            <h3 className="text-lg font-semibold mb-4">{status.name}</h3>
            <div className="space-y-4">
                {columnBugs.map((bug) => {

                    return (
                        <BugCard
                            key={bug._id}
                            bug={bug}
                            onEdit={onBugEdit}
                            setShowViewBug={setShowViewBug}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export const BugGrid = ({ onBugClick, setShowViewBug }: BugGridProps) => {
    const { currentUser } = useContext<IUserContext>(UserContext);
    const [columnView, setColumnView] = useState<'status' | 'priority' | 'assignedTo'>('assignedTo');
    const bugs = useQuery(api.bugs.get);
    const users = useQuery(api.users.get);
    const statuses = useQuery(api.status.get);
    const priorities = useQuery(api.priority.get);
    const updateBug = useMutation(api.bugs.update);
    const createLog = useMutation(api.logs.create);

    const handleDrop = async (bugId: Id<"bugs">, priorityId: Id<"priority">) => {
        const bug = bugs?.find(b => b._id === bugId);
        const priority = priorities?.find(p => p._id === priorityId);
        if (!bug || bug.priority === priorityId) {
            return;
        }
        try {
            await updateBug({
                id: bugId,
                title: bug.title,
                description: bug.description,
                status: bug.status,
                priority: priorityId,
                reporter: bug.reporter,
                assignedTo: bug.assignedTo,
            });

            await createLog({
                action: `Bug priority changed to ${priority?.name}`,
                user: currentUser?._id,
                bug: bugId,
            });

        } catch (error) {
            console.error('Failed to update bug priority:', error);
        }
    };

    const handleDropStatus = async (bugId: Id<"bugs">, statusId: Id<"status">) => {
        const bug = bugs?.find(b => b._id === bugId);
        if (!bug || !bug.status || bug.status === statusId) {
            return;
        }
        const status = statuses?.find(s => s._id === statusId);

        try {
            await updateBug({
                id: bugId,
                title: bug.title,
                description: bug.description,
                status: statusId,
                priority: bug.priority,
                reporter: bug.reporter,
                assignedTo: bug.assignedTo,
            });
            await createLog({
                action: `Bug status changed to ${status?.name}`,
                user: currentUser?._id,
                bug: bugId,
            });
        } catch (error) {
            console.error('Failed to update bug status:', error);
        }
    };

    const handleDropAssignedTo = async (bugId: Id<"bugs">, assignedToId: Id<"users">) => {
        const bug = bugs?.find(b => b._id === bugId);
        if (!bug || bug.assignedTo === assignedToId) {
            return;
        }
        const assignedTo = users?.find(u => u._id === assignedToId);

        try {
            await updateBug({
                id: bugId,
                title: bug.title,
                description: bug.description,
                status: bug.status,
                priority: bug.priority,
                reporter: bug.reporter,
                assignedTo: assignedToId,
            });
            await createLog({
                action: `Bug assigned to ${assignedTo?.name}`,
                user: currentUser?._id,
                bug: bugId,
            });
        } catch (error) {
            console.error('Failed to update bug assigned to:', error);
        }
    };

    if (!bugs || !users || !statuses || !priorities) {
        return <div>Loading...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="space-y-4">
                <div className="flex items-center justify-end space-x-2 bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">View by:</span>
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setColumnView('status')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'status'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Status
                        </button>
                        <button
                            onClick={() => setColumnView('priority')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'priority'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Priority
                        </button>
                        <button
                            onClick={() => setColumnView('assignedTo')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${columnView === 'assignedTo'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Assigned To
                        </button>
                    </div>
                </div>

                {columnView === 'status' ? (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${statuses.length}, 1fr)` }}>
                        {statuses.map((status) => (
                            <StatusColumn
                                key={status._id}
                                status={status}
                                bugs={bugs}
                                onBugEdit={onBugClick}
                                onDrop={handleDropStatus}
                                setShowViewBug={setShowViewBug}
                            />
                        ))}
                    </div>
                ) : columnView === 'assignedTo' ? (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${users.length}, 1fr)` }}>
                        {users.map((user) => (
                            <AssignedToColumn
                                key={user._id}
                                assignedTo={user}
                                bugs={bugs}
                                onBugEdit={onBugClick}
                                onDrop={handleDropAssignedTo}
                                setShowViewBug={setShowViewBug}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${priorities.length}, 1fr)` }}>
                        {priorities.map((priority) => (
                            <PriorityColumn
                                key={priority._id}
                                priority={priority}
                                bugs={bugs}
                                onBugEdit={onBugClick}
                                onDrop={handleDrop}
                                setShowViewBug={setShowViewBug}
                            />
                        ))}
                    </div>
                )}
            </div>

        </DndProvider>
    );
}; 