import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { ListComments, ListUsers, ListBugs, MainNav } from "./component";
import { api } from "../convex/_generated/api";
import type { Doc } from "../convex/_generated/dataModel";

import { UserContext } from "./context/userContext";

function App() {
  const [view, setView] = useState<string>("bugs");
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const users = useQuery(api.users.get);

  useEffect(() => {
    if (users) {
      setCurrentUser(users[0]);
    }
  }, [users]);


  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <div className="grid grid-rows-[72px_1fr_auto] h-screen">
        <div className="header background-black px-4  grid grid-cols-[1fr_auto_1fr] w-full">
          <div className="flex flex-row justify-left">
            <div className="py-2">
              <span>Bug Tracker</span>
            </div>
            <MainNav setView={setView} view={view} />
          </div>
        </div>

        {view === 'bugs' && <ListBugs />}
        {view === 'users' && <ListUsers />}
        {view === 'comments' && <ListComments />}

      </div>
    </UserContext.Provider >
  );
}

export default App;
