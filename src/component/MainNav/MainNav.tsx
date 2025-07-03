import React from 'react';

import { DropdownMenu } from '../DropdownMenu';

export interface IMainNavProps {
    setView: (view: string) => void;
    view: string;
}

export const MainNav: React.FunctionComponent<IMainNavProps> = ({ setView, view }) => {
    let navNames = [{ label: 'Users', value: 'users' },
    { label: 'Tickets', value: 'tickets' },
    { label: 'Logs', value: 'logs' },
    { label: 'Projects', value: 'projects' },
    { label: 'Tags', value: 'tags' },
    { label: 'Comments', value: 'comments' },
    { label: 'Calendar', value: 'calendar' }];

    navNames = navNames.sort((a, b) => a.label.localeCompare(b.label));

    return (<div className="relative flex items-center justify-between h-16 mt-1" >
        <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:block sm:ml-6">
                <div className="flex space-x-4 z-10">
                    <DropdownMenu selected={view} options={navNames} setOption={(option) => setView(option.value)} />
                </div>
            </div>
        </div>
    </div >);

}