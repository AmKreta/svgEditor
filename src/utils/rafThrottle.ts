export type RAFThrottledFn<T extends (...args: any[]) => void> = ((
    ...args: Parameters<T>
) => void) & {
    flush: () => void;
    cancel: () => void;
};

/**
 * Coalesces bursts of calls to at most once per animation frame.
 * The last arguments passed in a frame are the ones delivered.
 * Callers that need to accumulate (e.g. drag deltas) should mutate a ref
 * and invoke the throttled fn with no args.
 */
export function createRAFThrottled<T extends (...args: any[]) => void>(fn: T): RAFThrottledFn<T> {
    let frameId: number | null = null;
    let latestArgs: Parameters<T> | null = null;
    let hasPending = false;

    const invoke = () => {
        frameId = null;
        if (!hasPending) {
            return;
        }
        hasPending = false;
        const args = latestArgs;
        latestArgs = null;
        if (args) {
            fn(...args);
        } else {
            (fn as () => void)();
        }
    };

    const schedule = ((...args: Parameters<T>) => {
        latestArgs = args;
        hasPending = true;
        if (frameId == null) {
            frameId = requestAnimationFrame(invoke);
        }
    }) as RAFThrottledFn<T>;

    schedule.flush = () => {
        if (frameId != null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        invoke();
    };

    schedule.cancel = () => {
        if (frameId != null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
        hasPending = false;
        latestArgs = null;
    };

    return schedule;
}
