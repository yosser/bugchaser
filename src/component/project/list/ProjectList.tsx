import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { AddProject } from "../add/AddProject";
import { EditProject } from "../edit/EditProject";

export const ProjectList = () => {
    const projects = useQuery(api.projects.get);
    const removeProject = useMutation(api.projects.removeProject);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Id<"projects"> | null>(null);

    const handleDelete = async (id: Id<"projects">) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await removeProject({ id });
            } catch (error) {
                console.error("Failed to delete project:", error);
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Project
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects?.map((project) => (
                            <tr key={project._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">{project.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => setEditingProject(project._id)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddModalOpen && (
                <AddProject onClose={() => setIsAddModalOpen(false)} />
            )}

            {editingProject && (
                <EditProject
                    projectId={editingProject}
                    onClose={() => setEditingProject(null)}
                />
            )}
        </div>
    );
}; 