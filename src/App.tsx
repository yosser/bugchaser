import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useCookies } from "react-cookie";

import { Calendar, ListComments, ListTickets, ListLogs, ListTags, ProjectList, UserList, MainNav } from "./component";

import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { UserContext } from "./context/userContext";
import { LoginModal } from "./component/auth/LoginModal";
import { ProjectSelectDialog } from "./component/project/select/ProjectSelectDialog";

const defaultTicketTypes = [
  {
    name: "Bug",
    value: 1,
    description: "A bug is a problem with the software that needs to be fixed.",
  },
  {
    name: "Feature",
    value: 2,
    description: "A feature is a new feature that needs to be added to the software.",
  },
  {
    name: "Task",
    value: 3,
    description: "A task is a task that needs to be done.",
  },
  {
    name: "Other",
    value: 4,
    description: "Other is a ticket that doesn't fit into any other category.",
  },
];

function App() {
  const [view, setView] = useState<string>("calendar");
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const [currentProject, setCurrentProject] = useState<Doc<"projects"> | null>(null);
  const [showProjectSelect, setShowProjectSelect] = useState(false);
  const projects = useQuery(api.projects.get);
  const ticketTypes = useQuery(api.ticketType.get);
  const createTicketType = useMutation(api.ticketType.create);
  const userProjects = useQuery(api.projectsUsers.getByUser, { userId: currentUser?._id });
  const users = useQuery(api.users.get);
  const [cookies, setCookie] = useCookies(["user"]);

  useEffect(() => {
    const createDefaultTicketTypes = async () => {
      defaultTicketTypes.forEach(async (ticketType) => {
        await createTicketType({ ...ticketType, isDeleted: false });
      });
    };

    if (undefined !== ticketTypes && ticketTypes.length === 0) {
      createDefaultTicketTypes();
    }
  }, [ticketTypes, createTicketType]);

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

  useEffect(() => {
    if (cookies.user) {
      setCurrentUser(cookies.user);
    }
  }, [cookies.user]);

  const handleLogin = (userId: Id<"users">) => {
    const user = users?.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      setShowProjectSelect(true);
      setCookie("user", user, { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCookie("user", null, { path: "/", expires: new Date(Date.now() - 1000) });
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
              <span>Ticket Tracker</span>
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
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:bg-blue-700 hover:text-white rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
          {view === 'calendar' && <Calendar />}
          {view === 'tickets' && <ListTickets />}
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
