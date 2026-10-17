import { useEffect, useRef } from 'react';
import { createRAFThrottled, RAFThrottledFn } from '../utils/rafThrottle';
import { useLatestRef } from './useLatestRef';

export function useRAFThrottled<T extends (...args: any[]) => void>(fn: T): RAFThrottledFn<T> {
    const fnRef = useLatestRef(fn);
    const throttledRef = useRef<RAFThrottledFn<T>>();

    if (!throttledRef.current) {
        throttledRef.current = createRAFThrottled(((...args: Parameters<T>) => {
            fnRef.current(...args);
        }) as T);
    }

    useEffect(() => {
        return () => throttledRef.current?.cancel();
    }, []);

    return throttledRef.current;
}
