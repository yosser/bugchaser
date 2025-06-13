import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AddBug } from "../add";
import { EditBug } from "../edit";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import { BugGrid } from "../grid/BugGrid";
import { BugList } from "./BugList";
import { ViewBug } from "../view/ViewBug";
type ViewMode = "grid" | "list";

export const ListBugs = () => {
    const bugs = useQuery(api.bugs.get);
    const [showViewBug, setShowViewBug] = useState<Id<'bugs'> | null>(null);
    const [showAddBug, setShowAddBug] = useState(false);
    const [bugToEdit, setBugToEdit] = useState<Doc<"bugs"> | null>(null);
    const [bugToDelete, setBugToDelete] = useState<Doc<"bugs"> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const deleteBug = useMutation(api.bugs.remove);

    const handleDelete = async (bugId: Id<"bugs">) => {
        try {
            setError(null);
            await deleteBug({ id: bugId });
            setBugToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete bug");
        }
    };

    const handleBugClick = (bug: Doc<"bugs">) => {
        setShowViewBug(null);
        setBugToEdit(bug);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Bugs</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "grid"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${viewMode === "list"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            List
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddBug(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Add Bug
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {viewMode === "grid" ? (
                <BugGrid onBugClick={handleBugClick} setShowViewBug={setShowViewBug} />
            ) : (
                <BugList
                    onBugClick={handleBugClick}
                    onDeleteClick={setBugToDelete}
                />
            )}
            {showViewBug && bugs?.find(b => b._id === showViewBug) && (
                <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-4xl">
                        <ViewBug
                            bugId={showViewBug}
                            onEdit={handleBugClick}
                            onClose={() => setShowViewBug(null)}
                        />
                    </div>
                </div>
            )}
            {showAddBug && <AddBug onClose={() => setShowAddBug(false)} />}
            {bugToEdit && <EditBug bug={bugToEdit} onClose={() => setBugToEdit(null)} />}
            <ConfirmationModal
                isOpen={!!bugToDelete}
                title="Delete Bug"
                message={`Are you sure you want to delete "${bugToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => bugToDelete && handleDelete(bugToDelete._id)}
                onCancel={() => setBugToDelete(null)}
                variant="danger"
            />
        </div>
    );
};