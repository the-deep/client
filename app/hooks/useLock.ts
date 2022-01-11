import { useState, useEffect } from 'react';

type LockState = 'PENDING' | 'ACQUIRED' | 'REJECTED' | 'RELEASED' | 'ABORTED' | 'NOT_SUPPORTED';

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

            let myAbortController: AbortController | undefined = new AbortController();

            navigator.locks.request(key, { signal: myAbortController.signal }, (lock) => {
                myAbortController = undefined;

                if (mounted) {
                    setLockState(lock ? 'ACQUIRED' : 'REJECTED');
                }
                return myPromise;
            }).catch((err: unknown) => {
                if (myAbortController && myAbortController.signal.aborted) {
                    // eslint-disable-next-line no-console
                    console.warn('Lock request was aborted');
                } else {
                    // eslint-disable-next-line no-console
                    console.error('Lock request error', err);
                }
            });

            return () => {
                mounted = false;

                // NOTE: if myAbortController is defined then lock was never
                // acquired to be released
                if (myAbortController) {
                    myAbortController.abort();
                    setLockState('ABORTED');
                } else if (myResolve) {
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
