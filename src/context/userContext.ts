import { createContext } from "react";
import type { Doc } from "../../convex/_generated/dataModel";


export interface IUserContext {
    currentUser: Doc<"users"> | null;
    setCurrentUser: (user: Doc<"users">) => void;
}

export const UserContext = createContext<IUserContext>({ currentUser: null, setCurrentUser: () => { } });
