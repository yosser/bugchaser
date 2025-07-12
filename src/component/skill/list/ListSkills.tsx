import { useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { DateTime } from "luxon";
import { EditSkill } from "../edit";
import { AddSkill } from "../add";
import { ConfirmationModal } from "../../common/ConfirmationModal";
import type { Id } from "../../../../convex/_generated/dataModel";


export const ListSkills: React.FunctionComponent = () => {
    const [skillToEdit, setSkillToEdit] = useState<Doc<"skills"> | null>(null);
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skillToDelete, setSkillToDelete] = useState<Doc<"skills"> | null>(null);
    const updateSkill = useMutation(api.skills.update);
    const deleteSkill = useMutation(api.skills.remove);
    const skills = useQuery(api.skills.get);

    const formatTime = (timestamp: number | undefined) => {
        if (!timestamp) return "Unknown time";
        return DateTime.fromMillis(timestamp).toRelative() || "Unknown time";
    };
    const handleDelete = async (skillId: Id<"skills">) => {
        try {
            setError(null);
            await deleteSkill({ id: skillId });
            setSkillToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete skill");
        }
    };

    const retireSkill = async (skill: Doc<"skills">) => {
        try {
            setError(null);
            await updateSkill({ id: skill._id, isDeleted: !skill.isDeleted });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to retire skill");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Skills</h2>
                <button
                    onClick={() => setShowAddSkill(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Add Skill
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

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
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Is deleted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(skills ?? []).map((skill) => (
                            <tr key={skill._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {skill.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {skill.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(skill.createdAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {formatTime(skill.updatedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {skill.isDeleted ? "Yes" : "No"}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex px-2 justify-self-end">
                                        <button
                                            onClick={() => setSkillToEdit(skill)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => retireSkill(skill)}
                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                        >
                                            {skill.isDeleted ? "Unretire" : "Retire"}
                                        </button>
                                        <button
                                            onClick={() => setSkillToDelete(skill)}
                                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {skillToEdit && <EditSkill skill={skillToEdit} onClose={() => setSkillToEdit(null)} />}
            {showAddSkill && <AddSkill onClose={() => setShowAddSkill(false)} />}
            <ConfirmationModal
                isOpen={!!skillToDelete}
                title="Delete Skill"
                message={`Are you sure you want to delete ${skillToDelete?.name}? This action cannot be undone.`}
                confirmText="Delete"
                onConfirm={() => skillToDelete && handleDelete(skillToDelete._id)}
                onCancel={() => setSkillToDelete(null)}
                variant="danger"
            />
        </div >
    );
};
