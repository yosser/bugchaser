import { useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface EditTagProps {
    tag: Doc<"tags">;
    onClose: () => void;
}

export const EditTag = ({ tag, onClose }: EditTagProps) => {
    const [formData, setFormData] = useState({
        name: tag.name,
        color: tag.color || "#3B82F6", // Default blue color if no color is set
    });

    const updateTag = useMutation(api.tags.update);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateTag({
                id: tag._id,
                ...formData
            });
            onClose();
        } catch (error) {
            console.error("Failed to update tag:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Edit Tag</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                id="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="w-12 h-12 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                value={formData.color}
                                onChange={handleChange}
                                name="color"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="#000000"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 