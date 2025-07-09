import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useOnClickOutside(ref: React.RefObject<HTMLElement | null> | HTMLElement | null | Array<React.RefObject<HTMLElement> | HTMLElement | null>, handler: (event: Event) => void) {
    useEffect(
        () => {
            const listener = (event: Event) => {
                if (Array.isArray(ref)) {
                    if (ref.some(thisRef => {
                        if ((thisRef instanceof HTMLElement)
                            && (thisRef.contains(event.target as Node))) {
                            return true;
                        }
                        else if (!(thisRef instanceof HTMLElement) && thisRef && thisRef.current && thisRef.current.contains(event.target as Node)) {
                            return true;
                        }
                        return false;
                    })) {
                        return;
                    }
                }
                else if ((ref instanceof HTMLElement)
                    && (ref.contains(event.target as Node))) {
                    return;
                }
                else if (!(ref instanceof HTMLElement) && ref && ref.current && ref.current.contains(event.target as Node)) {
                    return;
                }
                handler(event);
            };
            document.addEventListener("mousedown", listener);
            document.addEventListener("touchstart", listener);
            return () => {
                document.removeEventListener("mousedown", listener);
                document.removeEventListener("touchstart", listener);
            };
        },
        // Add ref and handler to effect dependencies
        // It's worth noting that because passed in handler is a new ...
        // ... function on every render that will cause this effect ...
        // ... callback/cleanup to run every render. It's not a big deal ...
        // ... but to optimize you can wrap handler in useCallback before ...
        // ... passing it into this hook.
        [ref, handler]
    );
}
/**
 * Returns a callback ref that calls `drag(element)` when the DOM node is attached.
 */
export function useDragRef(drag: (el: HTMLDivElement) => void) {
    return useCallback((element: HTMLDivElement | null) => {
        if (element) {
            drag(element);
        }
    }, [drag]);
}

export default useDragRef;