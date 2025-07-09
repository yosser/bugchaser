import { useContext, useEffect, useState } from "react";
import Select from "react-select";
import type { MultiValue } from "react-select";
import type { Id, Doc } from "../../../../convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAppDispatch as useDispatch } from "../../../hooks";
import { addToast } from "../../../store";
import { UserContext } from "../../../context/userContext";

interface EditUserProps {
    user: Doc<"users">;
    onClose: () => void;
}

export const EditUser = ({ user, onClose }: EditUserProps) => {
    const dispatch = useDispatch();
    const { currentUser } = useContext(UserContext);
    const roles = useQuery(api.roles.get);
    const expandedUser = useQuery(api.users.getById, { id: user._id });
    const userQualifications = useQuery(api.qualificationsUsers.get, { user: user._id });
    const userSkills = useQuery(api.skillsUser.get, { user: user._id });
    const userLocations = useQuery(api.locationsUsers.get, { user: user._id });

    const qualifications = useQuery(api.qualifications.get);
    const skills = useQuery(api.skills.get);
    const locations = useQuery(api.locations.get);

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email || "",
        role: user.role,
        qualifications: [] as Array<{ value: Id<"qualifications">, label: string }>,
        locationsToAvoid: [] as Array<{ value: Id<"locations">, label: string }>,
        skills: [] as Array<{ value: Id<"skills">, label: string }>,

    });

    useEffect(() => {
        const getQualificationsFromIds = (): Array<{ value: Id<"qualifications">, label: string }> => {
            const goodUserQualifications = userQualifications?.filter(userQualification => qualifications?.find(q => q._id === userQualification.qualification));
            const goodQualifications = qualifications?.filter(q => goodUserQualifications?.some(userQualification => userQualification.qualification === q._id));
            return goodQualifications?.map(q => ({ value: q._id, label: q.name })) ?? [];
        }
        const getLocationsFromIds = (): Array<{ value: Id<"locations">, label: string }> => {
            const goodUserLocations = userLocations?.filter(userLocation => locations?.find(l => l._id === userLocation.location));
            const goodLocations = locations?.filter(l => goodUserLocations?.some(userLocation => userLocation.location === l._id));
            return goodLocations?.map(l => ({ value: l._id, label: l.name })) ?? [];
        }
        const getSkillsFromIds = (): Array<{ value: Id<"skills">, label: string }> => {
            const goodUserSkills = userSkills?.filter(userSkill => skills?.find(s => s._id === userSkill.skill));
            const goodSkills = skills?.filter(s => goodUserSkills?.some(userSkill => userSkill.skill === s._id));
            return goodSkills?.map(s => ({ value: s._id, label: s.name })) ?? [];
        }

        if (expandedUser !== undefined && userQualifications !== undefined && qualifications !== undefined) {

            setFormData({
                name: expandedUser?.name ?? '',
                email: expandedUser?.email ?? "",
                role: expandedUser?.role ?? '' as Id<"role">,
                qualifications: getQualificationsFromIds(),
                locationsToAvoid: getLocationsFromIds(),
                skills: getSkillsFromIds(),

            });

        }
    }, [expandedUser, userQualifications, qualifications, userLocations, locations, userSkills, skills]);

    const updateUser = useMutation(api.users.update);

    const deleteQualification = useMutation(api.qualificationsUsers.remove);
    const deleteSkill = useMutation(api.skillsUser.remove);
    const deleteLocation = useMutation(api.locationsUsers.remove);
    const addQualifications = useMutation(api.qualificationsUsers.create);
    const addSkill = useMutation(api.skillsUser.create);
    const addLocation = useMutation(api.locationsUsers.create);
    const createLog = useMutation(api.logs.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const qualificationsToAdd = (formData.qualifications ?? []).filter(qualification =>
                (userQualifications ?? []).every(q => q.qualification !== qualification.value)
            )
            const qualificationsToRemove = (userQualifications ?? []).filter(userQualification =>
                (formData.qualifications ?? []).every(q => q.value !== userQualification.qualification)
            )
            const locationsToAdd = (formData.locationsToAvoid ?? []).filter(location =>
                (userLocations ?? []).every(l => l.location !== location.value)
            )
            const locationsToRemove = (userLocations ?? []).filter(userLocation =>
                (formData.locationsToAvoid ?? []).every(l => l.value !== userLocation.location)
            )
            const skillsToAdd = (formData.skills ?? []).filter(skill =>
                (userSkills ?? []).every(s => s.skill !== skill.value)
            )
            const skillsToRemove = (userSkills ?? []).filter(userSkill =>
                (formData.skills ?? []).every(s => s.value !== userSkill.skill)
            )

            const newUser = {
                ...formData,
                qualifications: undefined,
                skills: undefined,
                locationsToAvoid: undefined
            };
            await Promise.all([
                ...qualificationsToAdd.map(qualification => addQualifications({ qualification: qualification.value, user: user._id })),
                ...qualificationsToRemove.map(qualification => deleteQualification({ id: qualification._id })),
                ...locationsToAdd.map(location => addLocation({ location: location.value, user: user._id })),
                ...locationsToRemove.map(location => deleteLocation({ id: location._id })),
                ...skillsToAdd.map(skill => addSkill({ skill: skill.value, user: user._id })),
                ...skillsToRemove.map(skill => deleteSkill({ id: skill._id })),
                updateUser({
                    id: user._id,
                    ...newUser,
                })
            ]);
            await createLog({
                action: `User updated ${user.name}`,
                user: currentUser?._id,
            });
            dispatch(addToast("User updated"));
            onClose();
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };
    const handleQualificationsChange = (option: MultiValue<{ value: Id<"qualifications">, label: string }> | null) => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                qualifications: option.map(o => ({ value: o.value, label: o.label }))
            }));
        };
    };
    const handleLocationsChange = (option: MultiValue<{ value: Id<"locations">, label: string }> | null) => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                locationsToAvoid: option.map(o => ({ value: o.value, label: o.label }))
            }));
        };
    };

    const handleSkillsChange = (option: MultiValue<{ value: Id<"skills">, label: string }> | null) => {
        if (option) {
            setFormData(prev => ({
                ...prev,
                skills: option.map(o => ({ value: o.value, label: o.label }))
            }));
        };
    };

    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-semibold mb-6">Edit User</h2>
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select Role</option>
                            {roles?.map(role => (
                                <option key={role._id} value={role._id}>{role.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-1">
                            Qualifications
                        </label>
                        <Select
                            id="qualifications"
                            name="qualifications"
                            value={formData.qualifications}
                            isMulti={true}
                            onChange={handleQualificationsChange}
                            options={(qualifications ?? []).map(q => ({ value: q._id, label: q.name }))}
                        />
                    </div>


                    <div>
                        <label htmlFor="locationsToAvoid" className="block text-sm font-medium text-gray-700 mb-1">
                            Locations to avoid
                        </label>
                        <Select
                            id="locationsToAvoid"
                            name="locationsToAvoid"
                            value={formData.locationsToAvoid}
                            isMulti={true}
                            onChange={handleLocationsChange}
                            options={(locations ?? []).map(q => ({ value: q._id, label: q.name }))}
                        />
                    </div>

                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                            Skills
                        </label>
                        <Select
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            isMulti={true}
                            onChange={handleSkillsChange}
                            options={(skills ?? []).map(q => ({ value: q._id, label: q.name }))}
                        />
                    </div>


                    <div></div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => onClose()}
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
            </div >
        </div >
    );
};
