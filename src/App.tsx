import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { ListComments, ListBugs, ListLogs, ListTags, ProjectList, UserList, MainNav } from "./component";

import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { UserContext } from "./context/userContext";
import { LoginModal } from "./component/auth/LoginModal";
import { ProjectSelectDialog } from "./component/project/select/ProjectSelectDialog";

function App() {
  const [view, setView] = useState<string>("bugs");
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const [currentProject, setCurrentProject] = useState<Doc<"projects"> | null>(null);
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const projects = useQuery(api.projects.get);
  const userProjects = useQuery(api.projectsUsers.getByUser, { userId: currentUser?._id });
  const users = useQuery(api.users.get);

  useEffect(() => {
    if (userProjects && projects) {
      const projectId = userProjects[0]?.project;
      if (projectId) {
        const project = projects.find(p => p._id === projectId);
        if (project) {
          setCurrentProject(project);
        }
      }
    }
  }, [userProjects, projects]);

  const handleLogin = (userId: Id<"users">) => {
    const user = users?.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      setShowProjectSelect(true);
    }
  };

  const handleProjectSelect = (project: Doc<"projects">) => {
    setCurrentProject(project);
    setShowProjectSelect(false);
  };

  const handleProjectClick = () => {
    if (currentUser) {
      setShowProjectSelect(true);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, currentProject, setCurrentProject }}>
      {!currentUser ? (
        <LoginModal onLogin={handleLogin} />
      ) : showProjectSelect ? (
        <ProjectSelectDialog
          userId={currentUser._id}
          onSelect={handleProjectSelect}
        />
      ) : (
        <div className="grid grid-rows-[72px_1fr_auto] h-screen">
          <div className="header px-4 grid grid-cols-[auto_auto_1fr_1fr] w-full bg-blue-800">
            <div className="m-2 py-2 text-xl text-white">
              <span>Bug Tracker</span>
            </div>
            <div className="m-2 py-2">
              <button
                onClick={handleProjectClick}
                className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md text-lg px-2 py-1"
              >
                {currentProject?.name || 'No Project Selected'}
              </button>
            </div>
            <MainNav setView={setView} view={view} />

            <div className="flex items-center gap-4 justify-self-end">
              <div className="text-gray-300">
                <span className="text-sm">Logged in as: </span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
              <button
                onClick={() => setCurrentUser(null)}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:bg-blue-700 hover:text-white rounded-md"
              >
                Logout
              </button>
            </div>
          </div>

          {view === 'bugs' && <ListBugs />}
          {view === 'users' && <UserList />}
          {view === 'comments' && <ListComments />}
          {view === 'projects' && <ProjectList />}
          {view === 'tags' && <ListTags />}
          {view === 'logs' && <ListLogs />}
        </div>
      )}
    </UserContext.Provider>
  );
}

export default App;
