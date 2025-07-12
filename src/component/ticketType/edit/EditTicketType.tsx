import { useState } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface EditTicketTypeProps {
    ticketType: Doc<"ticketType">;
    onClose: () => void;
}

export const EditTicketType: React.FC<EditTicketTypeProps> = ({ ticketType, onClose }) => {
    const [formData, setFormData] = useState({
        name: ticketType.name,
        description: ticketType.description || "", // Default blue color if no color is set
        value: ticketType.value,
        colour: ticketType.colour,
        textColour: ticketType.textColour,
        isDeleted: ticketType.isDeleted,
    });

    const updateTicketType = useMutation(api.ticketType.update);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateTicketType({
                id: ticketType._id,
                ...formData
            });
            onClose();
        } catch (error) {
            console.error("Failed to update ticketType:", error);
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
                <h2 className="text-2xl font-semibold mb-6">Edit TicketType</h2>
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
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                        </label>
                        <input
                            type="number"
                            id="value"
                            name="value"
                            value={formData.value}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>


                    <div>
                        <span className="text-sm font-medium text-gray-700 mb-1 p-2 rounded-md" style={{ color: formData.textColour, backgroundColor: formData.colour }}>Sample text</span>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Colour
                        </label>
                        <input
                            className="w-12 h-12 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="color"
                            id="colour"
                            name="colour"
                            value={formData.colour}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Text Colour
                        </label>
                        <input
                            className="w-12 h-12 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="color"
                            id="textColour"
                            name="textColour"
                            value={formData.textColour}
                            onChange={handleChange}
                        />
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
                </form >
            </div >
        </div >
    );
}; 