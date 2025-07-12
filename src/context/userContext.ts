import { createContext } from "react";
import type { Doc } from "../../convex/_generated/dataModel";

export interface IUserContext {
    currentUser: Doc<"users"> | null;
    setCurrentUser: (user: Doc<"users">) => void;
    currentProject: Doc<"projects"> | undefined;
    setCurrentProject: (project: Doc<"projects">) => void;
    currentEpic: Doc<"epics"> | undefined;
    setCurrentEpic: (epic: Doc<"epics">) => void;
}

export const UserContext = createContext<IUserContext>({ currentUser: null, setCurrentUser: () => { }, currentProject: undefined, setCurrentProject: () => { }, currentEpic: undefined, setCurrentEpic: () => { } });
