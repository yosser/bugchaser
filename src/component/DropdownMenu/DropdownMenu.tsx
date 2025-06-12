import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks';

export type TDropdownMenuProps = {
    options: Array<{ label: string, value: string, disabled?: boolean }>;
    selected: string;
    setOption: (option: { label: string, value: string }) => void;
}

export const DropdownMenu: React.FunctionComponent<TDropdownMenuProps> = ({ options, selected, setOption }) => {
    const mainRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useOnClickOutside(mainRef, () => setIsOpen(false));

    const selectOption = (option: { label: string, value: string }) => {
        setOption(option);
        setIsOpen(false);
    }

    return (<div ref={mainRef} className="relative inline-block text-left">

        <div>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="inline-flex w-full justify-center background-dark-grey-button  px-3 py-2 rounded-md text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-hvpd-pickled-bluewood focus:ring-offset-2 focus:ring-offset-gray-100" id="menu-button" >
                <span className="text-dark-grey me-2">{options.find(o => o.value === selected)?.label || 'Select'}</span>
                <em>▼</em>
            </button>
        </div>

        <div className="absolute left-0 z-[3000] mt-2 w-48 origin-top-right rounded-md bg-hvpd-grey-50 shadow-lg shadow-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabIndex={-1}>
            <div className={`${isOpen ? '' : 'hidden'} py-1`} role="none">
                {options.map((option) => (
                    <button type='button' key={`menu-${option.value}`} disabled={option.disabled} onClick={() => selectOption(option)} className="text-gray-700 bg-hvpd-grey-50 w-full text-left block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white disabled:text-hvpd-grey-400">{option.label}</button>
                ))}
            </div>
        </div>
    </div >)
}