import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

interface ProjectSelectDialogProps {
    userId: Id<"users">;
    onSelect: (project: Doc<"projects">) => void;
}

export const ProjectSelectDialog = ({ userId, onSelect }: ProjectSelectDialogProps) => {
    const projects = useQuery(api.projects.get);
    const userProjects = useQuery(api.projectsUsers.getByUser, { userId });

    const availableProjects = projects?.filter(project =>
        userProjects?.some(up => up.project === project._id)
    ) ?? [];

    if (availableProjects.length === 0) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Select Project</h2>
                <div className="space-y-4">
                    {availableProjects.map((project) => (
                        <button
                            key={project._id}
                            onClick={() => onSelect(project)}
                            className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                            {project.description && (
                                <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}; 