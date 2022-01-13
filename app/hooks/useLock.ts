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

            let mounted = true;
            setLockState('PENDING');

            let myResolve: (value: string | PromiseLike<string>) => void;
            const myPromise = new Promise<string>((resolve) => {
                myResolve = resolve;
            });

            navigator.locks.request(
                key,
                { ifAvailable: true },
                (lock) => {
                    if (mounted) {
                        setLockState(lock ? 'ACQUIRED' : 'REJECTED');
                    }
                    return myPromise;
                },
            );

            return () => {
                mounted = false;

                if (myResolve) {
                    myResolve(key);
                    setLockState('RELEASED');
                }
            };
        },
        [key],
    );

    return lockState;
}

export default useLock;
