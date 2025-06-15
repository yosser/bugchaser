import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface ManageUserProjectsProps {
    userId: Id<"users">;
    onClose: () => void;
}

export const ManageUserProjects = ({ userId, onClose }: ManageUserProjectsProps) => {
    const projects = useQuery(api.projects.get);
    const userProjects = useQuery(api.projectsUsers.getByUser, { userId });
    const addUserToProject = useMutation(api.projectsUsers.addUserToProject);
    const removeUserFromProject = useMutation(api.projectsUsers.removeUserFromProject);

    const [selectedProject, setSelectedProject] = useState<Id<"projects"> | "">("");

    const handleAddToProject = async () => {
        if (selectedProject) {
            try {
                await addUserToProject({
                    userId,
                    projectId: selectedProject,
                });
                setSelectedProject("");
            } catch (error) {
                console.error("Failed to add user to project:", error);
            }
        }
    };

    const handleRemoveFromProject = async (projectId: Id<"projects">) => {
        try {
            await removeUserFromProject({
                userId,
                projectId,
            });
        } catch (error) {
            console.error("Failed to remove user from project:", error);
        }
    };

    const isUserInProject = (projectId: Id<"projects">) => {
        return userProjects?.some(up => up.project === projectId) ?? false;
    };

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Manage User Projects</h2>

                <div className="mb-6">
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                        Add to Project
                    </label>
                    <div className="flex gap-2">
                        <select
                            id="project"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value as Id<"projects">)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a project</option>
                            {projects?.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddToProject}
                            disabled={!selectedProject}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Projects</h3>
                    <div className="space-y-2">
                        {projects?.map((project) => {
                            const isInProject = isUserInProject(project._id);
                            if (!isInProject) return null;

                            return (
                                <div
                                    key={project._id}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                >
                                    <span className="text-sm text-gray-900">{project.name}</span>
                                    <button
                                        onClick={() => handleRemoveFromProject(project._id)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}; 