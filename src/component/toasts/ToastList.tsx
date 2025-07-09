import React, { useEffect, useState } from 'react';

import { useAppSelector as useSelector, useAppDispatch as useDispatch } from '../../hooks';
import { removeToast } from '../../store';

const TOAST_TIMEOUT = 4000;

export const ToastList: React.FunctionComponent = () => {
    const dispatch = useDispatch();
    const { toastList } = useSelector(store => store.main);
    const [localToasts, setLocalToasts] = useState<Array<{ id: number, timeout?: number }>>([]);

    const endToast = (toastId: number) => {
        dispatch(removeToast(toastId));
    }

    useEffect(() => {
        let workingToasts = [...localToasts];
        toastList.forEach(toast => {
            if (!workingToasts.some(wt => wt.id === toast.id)) {
                const timeout = setTimeout(() => endToast(toast.id), TOAST_TIMEOUT);
                workingToasts.push({
                    id: toast.id,
                    timeout
                });
            }
        });
        const deleteToasts: Array<number> = [];
        workingToasts.forEach(wt => {
            if (!toastList.some(toast => toast.id === wt.id)) {
                deleteToasts.push(wt.id);
                clearTimeout(wt.timeout);
            }
        })
        deleteToasts.forEach(id => dispatch(removeToast(id)));
        workingToasts = workingToasts.filter(wt => !deleteToasts.some(dt => wt.id === dt));
        setLocalToasts(workingToasts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toastList]);

    return (toastList.length > 0 ? <div className='fixed top-24 right-4 z-[3099]'>
        {toastList.map((toast, idx) =>
            <div key={`toast-${toast.id}`} style={{ transform: `translateY(${idx * 3.5}rem` }} className={`block absolute transition-all whitespace-nowrap  right-3 ease-in-out rounded-md min-w-20 drop-shadow px-2 py-2 text-white bg-sky-400`}>
                <div className="grid divide-x divide-sky-200 grid-cols-[auto_40px]">
                    <div className='inline-block pr-4'>{toast.message}</div>
                    <button title='Dismiss message' type="button" onClick={() => endToast(toast.id)} className="float-right hover:bg-sky-600">
                        X
                    </button>
                </div>
            </div>
        )}
    </div> : null);

}