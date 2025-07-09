import { useContext, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useAppDispatch as useDispatch } from "../../../hooks";
import { addToast } from "../../../store";
import { UserContext } from "../../../context/userContext";
import { EditTag } from "../edit/EditTag";
import { AddTag } from "../add/AddTag";
import { ConfirmationModal } from "../../common/ConfirmationModal";

export const ListTags: React.FunctionComponent = () => {
    const dispatch = useDispatch();
    const { currentUser } = useContext(UserContext);
    const tags = useQuery(api.tags.get);
    const [tagToEdit, setTagToEdit] = useState<Doc<"tags"> | null>(null);
    const [showAddTag, setShowAddTag] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tagToDelete, setTagToDelete] = useState<Doc<"tags"> | null>(null);
    const deleteTag = useMutation(api.tags.remove);
    const createLog = useMutation(api.logs.create);

    const handleDelete = async (tagId: Id<"tags">) => {
        try {
            setError(null);
            await deleteTag({ id: tagId });
            await createLog({
                action: `Tag deleted ${tags?.find(t => t._id === tagId)?.name}`,
                user: currentUser?._id,
            });
            dispatch(addToast("Tag deleted"));
            setTagToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete tag");
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Tags</h2>
                <button
                    onClick={() => setShowAddTag(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Tag
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                {tags?.map((tag) => (
                    <div key={tag._id} className="grid grid-cols-3 p-3 bg-white rounded-lg shadow">
                        <div className="flex items-center space-x-2">
                            {tag.color && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                            )}
                            <span className="font-medium">{tag.name}</span>
                        </div>
                        <span className="text-gray-500 justify-self-center">
                            {tag.color || 'No color'}
                        </span>
                        <div className="flex space-x-2 justify-self-end">
                            <button
                                onClick={() => setTagToEdit(tag)}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setTagToDelete(tag)}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {tagToEdit && <EditTag tag={tagToEdit} onClose={() => setTagToEdit(null)} />}
            {showAddTag && <AddTag onClose={() => setShowAddTag(false)} />}
            <ConfirmationModal
                isOpen={!!tagToDelete}
                title="Delete Tag"
                message={`Are you sure you want to delete ${tagToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => tagToDelete && handleDelete(tagToDelete._id)}
                onCancel={() => setTagToDelete(null)}
                variant="danger"
            />
        </div>
    );
}; 