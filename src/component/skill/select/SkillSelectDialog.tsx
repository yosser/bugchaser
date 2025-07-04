import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel"

interface SkillSelectDialogProps {
    onSelect: (skill: Doc<"skills"> | null) => void;
}

export const SkillSelectDialog: React.FC<SkillSelectDialogProps> = ({ onSelect }) => {
    const skills = useQuery(api.skills.get);

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6 text-center">Select Skill</h2>
                <div className="space-y-4">
                    <button
                        key={''}
                        onClick={() => onSelect(null)}
                        className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <h3 className="text-lg font-medium text-gray-900">All tickets</h3>

                        <p className="mt-1 text-sm text-gray-500">Select this to view all tickets</p>

                    </button>
                    {(skills ?? []).map((skill) => (
                        <button
                            key={skill._id}
                            onClick={() => onSelect(skill)}
                            className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <h3 className="text-lg font-medium text-gray-900">{skill.name}</h3>
                            {skill.description && (
                                <p className="mt-1 text-sm text-gray-500">{skill.description}</p>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}; 