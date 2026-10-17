import { RefObject, useEffect } from 'react';
import { useLatestRef } from './useLatestRef';

type Target = Window | Document | HTMLElement | SVGElement | null | undefined;
type TargetProp = Target | RefObject<HTMLElement | SVGElement | null>;

function resolveTarget(target: TargetProp): Target {
    if (target && typeof target === 'object' && 'current' in target) {
        return target.current;
    }
    return target as Target;
}

export function useEventListener<K extends keyof WindowEventMap>(
    event: K,
    handler: (ev: WindowEventMap[K]) => void,
    target?: TargetProp,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
    event: K,
    handler: (ev: DocumentEventMap[K]) => void,
    target: TargetProp,
    options?: boolean | AddEventListenerOptions
): void;

export function useEventListener(
    event: string,
    handler: (ev: Event) => void,
    target: TargetProp = typeof window !== 'undefined' ? window : null,
    options?: boolean | AddEventListenerOptions
): void {
    const handlerRef = useLatestRef(handler);

    useEffect(() => {
        const node = resolveTarget(target);
        if (!node) {
            return;
        }

        const listener = (ev: Event) => handlerRef.current(ev);
        node.addEventListener(event, listener, options);
        return () => node.removeEventListener(event, listener, options);
    }, [event, target, options]);
}
