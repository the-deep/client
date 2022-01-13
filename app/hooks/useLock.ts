import { useState, useEffect } from 'react';

type LockState = 'PENDING' | 'ACQUIRED' | 'REJECTED' | 'RELEASED' | 'NOT_SUPPORTED';

function useLock(key: string | undefined) {
    const [lockState, setLockState] = useState<LockState>(
        navigator.locks ? 'PENDING' : 'NOT_SUPPORTED',
    );

    useEffect(
        () => {
            if (!navigator.locks) {
                return undefined;
            }
            if (!key) {
                return undefined;
            }

            // NOTE: used to prevent calling setState on unmounted hook
            let mounted = true;
            // NOTE: used to resolve promise that holds acquired lock
            let lockPromiseResolver: ((value: string | PromiseLike<string>) => void) | undefined;

            setLockState('PENDING');

            navigator.locks.request(
                key,
                // NOTE: the lock request will fail immediately if a lock
                // already exists
                { ifAvailable: true },
                // NOTE: this callback is called asynchronously
                // NOTE: lock if null if the lock was not available
                (lock) => {
                    if (!lock) {
                        const myPromise = Promise.resolve(key);
                        lockPromiseResolver = undefined;
                        if (mounted) {
                            setLockState('REJECTED');
                        }
                        return myPromise;
                    }

                    const myPromise = new Promise<string>((resolve) => {
                        lockPromiseResolver = resolve;
                    });
                    if (mounted) {
                        setLockState('ACQUIRED');
                    }
                    // NOTE: the lock will not be released unless the promise
                    // resolves
                    return myPromise;
                },
            );

            return () => {
                mounted = false;

                if (lockPromiseResolver) {
                    lockPromiseResolver(key);
                    lockPromiseResolver = undefined;
                    setLockState('RELEASED');
                }
            };
        },
        [key],
    );

    return lockState;
}

export default useLock;
