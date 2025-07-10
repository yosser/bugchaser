import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useCookies } from "react-cookie";
import { Provider } from 'react-redux';
import { store } from './store/store';

import {
  Calendar, ListComments, ListEpics, ListTickets, ListLogs,
  ListLocations, ListPriorities,
  ListQualifications, ListTags, ProjectList, UserList, MainNav,
  ListSkills, ProjectDashboard, ListStatus, ListTicketType,
  ToastList,
} from "./component";

import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import { UserContext } from "./context/userContext";
import { LoginModal } from "./component/auth/LoginModal";
import { DropdownMenu } from "./component";

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

const defaultStatuses = [
  {
    name: "Open",
    value: 1,
    description: "A status that represents a task that is not yet started.",
  },
  { name: "Accepted", value: 2, description: "A status that represents a task that is accepted." },
  {
    name: "In Progress",
    value: 3,
    description: "A status that represents a task that is in progress.",
  },
  {
    name: "In Review", value: 3, description: "A status that represents a task that is in review."

  },
  { name: "In Test", value: 4, description: "A status that represents a task that is in test." },

  {
    name: "Done",
    value: 5,
    description: "A status that represents a task that is done.",
  },
  {
    name: "Closed",
    value: 6,
    description: "A status that represents a task that is closed.",
  },
  { name: "Cancelled", value: 7, description: "A status that represents a task that is cancelled." },
  { name: "Rejected", value: 8, description: "A status that represents a task that is rejected." },
  { name: "Blocked", value: 9, description: "A status that represents a task that is blocked." },
  { name: "On Hold", value: 10, description: "A status that represents a task that is on hold." },
  { name: "Deferred", value: 11, description: "A status that represents a task that is deferred." },
  { name: "Duplicate", value: 12, description: "A status that represents a task that is a duplicate." },
  { name: "Invalid", value: 13, description: "A status that represents a task that is invalid." },
];

const defaultPriorities = [
  { name: "Trivial", value: 1, description: "A priority that represents a task that is low.", color: "#f0fdf4", textColor: "#16a34a" },
  { name: "Minor", value: 2, description: "A priority that represents a task that is medium.", color: "#fffbeb", textColor: "#d97706" },
  { name: "Major", value: 3, description: "A priority that represents a task that is high.", color: "#fef2f2", textColor: "#dc2626" },
  { name: "Blocker", value: 4, description: "A priority that represents a task that is blocked.", color: "#f0fdf4", textColor: "#16a34a" },
  { name: "Critical", value: 5, description: "A priority that represents a task that is critical.", color: "#fef2f2", textColor: "#dc2626" },
];


function App() {
  const [view, setView] = useState<string>("tickets");
  const [projectOptions, setProjectOptions] = useState<Array<{ label: string, value: string }>>([]);
  const [epicOptions, setEpicOptions] = useState<Array<{ label: string, value: string }>>([]);
  const [currentUser, setCurrentUser] = useState<Doc<"users"> | null>(null);
  const [currentProject, setCurrentProject] = useState<Doc<"projects"> | undefined>();
  const [currentEpic, setCurrentEpic] = useState<Doc<"epics"> | undefined>();
  //const [showProjectSelect, setShowProjectSelect] = useState(false);
  //  const [showEpicSelect, setShowEpicSelect] = useState(false);
  const projects = useQuery(api.projects.get);
  const epics = useQuery(api.epics.get);
  const ticketTypes = useQuery(api.ticketType.get);
  const statuses = useQuery(api.status.get);
  const priorities = useQuery(api.priority.get);
  const createTicketType = useMutation(api.ticketType.create);
  const createStatus = useMutation(api.status.create);
  const createPriority = useMutation(api.priority.create);
  const userProjects = useQuery(api.projectsUsers.getByUser, { userId: currentUser?._id });

  const users = useQuery(api.users.get);
  const [cookies, setCookie] = useCookies(["user"]);

  useEffect(() => {
    const createDefaultTicketTypes = async () => {
      defaultTicketTypes.forEach(async (ticketType) => {
        await createTicketType({ ...ticketType, isDeleted: false });
      });
    };

    const createDefaultStatuses = async () => {
      defaultStatuses.forEach(async (status) => {
        await createStatus({ ...status });
      });
    };

    const createDefaultPriorities = async () => {
      defaultPriorities.forEach(async (priority) => {
        await createPriority({ ...priority });
      });
    };

    if (undefined !== ticketTypes && ticketTypes.length === 0) {
      createDefaultTicketTypes();
      createDefaultStatuses();
    }
    if (undefined !== statuses && statuses.length === 0) {
      createDefaultStatuses();
    }
    if (undefined !== priorities && priorities.length === 0) {
      createDefaultPriorities();
    }
  }, [ticketTypes, createTicketType, statuses, priorities, createStatus, createPriority]);

  useEffect(() => {
    if (userProjects && projects) {
      const projectId = userProjects[0]?.project;
      if (projectId) {
        const project = projects.find(p => p._id === projectId);
        if (project) {
          setCurrentProject(project);
        }
      }
      const projectOptions = projects.filter(p => userProjects.some(up => up.project === p._id)).map(p => ({ label: p.name, value: p._id }));
      setProjectOptions(projectOptions);
    }
  }, [userProjects, projects]);

  useEffect(() => {
    if (epics) {
      const epicOptions = epics.map(e => ({ label: e.name, value: e._id }));
      setEpicOptions([{ label: 'All Tickets', value: '' }, ...epicOptions]);
    }
  }, [epics, currentProject]);

  useEffect(() => {
    if (cookies.user) {
      setCurrentUser(cookies.user);
    }
  }, [cookies.user]);

  const handleLogin = (userId: Id<"users">) => {
    const user = users?.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      //     setShowProjectSelect(true);
      setCookie("user", user, { path: "/", expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCookie("user", null, { path: "/", expires: new Date(Date.now() - 1000) });
  };


  return (
    <Provider store={store}>
      <UserContext.Provider value={{ currentUser, setCurrentUser, currentProject, setCurrentProject, currentEpic, setCurrentEpic }}>
        {!currentUser ? (
          <LoginModal onLogin={handleLogin} />
        ) : (
          <div className="grid grid-rows-[72px_1fr_auto] h-screen">
            <ToastList />
            <div className="header px-4 grid grid-cols-[auto_auto_auto_1fr_1fr] w-full bg-blue-800">
              <div className="m-2 py-2">
                <span className="text-xl text-white">Ticket Tracker</span>
              </div>
              <div className="relative m-2 py-2 flex items-center justify-between h-16 mt-1" >
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-4 z-10">
                      <DropdownMenu selected={currentProject?._id ?? ''} options={projectOptions} setOption={(option) => setCurrentProject((projects ?? []).find(p => p._id === option.value))} />
                    </div>
                  </div>
                </div>
              </div >
              <div className="relative m-2 py-2 flex items-center justify-between h-16 mt-1" >
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-4 z-10">
                      <DropdownMenu selected={currentEpic?._id ?? ''} options={epicOptions} setOption={(option) => setCurrentEpic((epics ?? []).find(p => p._id === option.value))} />
                    </div>
                  </div>
                </div>
              </div >

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
            {view === 'epics' && <ListEpics />}
            {view === 'tickets' && <ListTickets />}
            {view === 'users' && <UserList />}
            {view === 'skills' && <ListSkills />}
            {view === 'priorities' && <ListPriorities />}
            {view === 'qualifications' && <ListQualifications />}
            {view === 'locations' && <ListLocations />}
            {view === 'comments' && <ListComments />}
            {view === 'projects' && <ProjectList />}
            {view === 'dashboard' && <ProjectDashboard />}
            {view === 'status' && <ListStatus />}
            {view === 'tags' && <ListTags />}
            {view === 'ticketTypes' && <ListTicketType />}
            {view === 'logs' && <ListLogs />}

          </div>
        )
        }
      </UserContext.Provider>
    </Provider>
  );
}

export default App;
