import { ProjectTickets } from "./ProjectTickets";

export const ProjectDashboard = () => {
    return (
        <div className="flex flex-col gap-4">

            <div className='grid grid-cols-2 gap-4' ><ProjectTickets /></div>
        </div>
    );
};