import { useRef, useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';

interface PendingRequestItem<K, Req> {
    key: K;
    request: Req;
    status: 'pending';
}
interface CompletedRequestItem<K, Req, Res> {
    key: K;
    request: Req;
    status: 'completed';
    response: Res,
}
interface FailedRequestItem<K, Req, Err> {
    key: K;
    request: Req;
    status: 'failed';
    error: Err,
}

export type RequestItem<K, Req, Res, Err> = PendingRequestItem<K, Req>
    | CompletedRequestItem<K, Req, Res>
    | FailedRequestItem<K, Req, Err>;

export function filterFailed<K, Req, Res, Err>(
    item: RequestItem<K, Req, Res, Err>,
): item is FailedRequestItem<K, Req, Err> {
    return item.status === 'failed';
}
export function filterCompleted<K, Req, Res, Err>(
    item: RequestItem<K, Req, Res, Err>,
): item is CompletedRequestItem<K, Req, Res> {
    return item.status === 'completed';
}
export function filterPending<K, Req, Res, Err>(
    item: RequestItem<K, Req, Res, Err>,
): item is PendingRequestItem<K, Req> {
    return item.status === 'pending';
}

// TODO: show progress
function useBatchManager<K, Req, Res, Err>() {
    const requestItems = useRef<RequestItem<K, Req, Res, Err>[]>([]);

    const startIndex = useRef(0);
    const endIndex = useRef(0);

    const init = useCallback(
        (requests: Req[], keySelector: (req: Req) => K) => {
            startIndex.current = 0;
            endIndex.current = 0;
            requestItems.current = requests.map((request) => ({
                key: keySelector(request),
                request,
                status: 'pending',
            }));
        },
        [],
    );

    const reset = useCallback(
        () => {
            startIndex.current = 0;
            endIndex.current = 0;
            requestItems.current = [];
        },
        [],
    );

    const pop = useCallback(
        // FIXME: change default batchSize
        (batchSize = 2) => {
            if (startIndex.current === 0 && endIndex.current === 0) {
                startIndex.current = 0;
                endIndex.current = Math.min(
                    batchSize,
                    requestItems.current.length,
                );
            } else {
                startIndex.current = Math.min(
                    startIndex.current + batchSize,
                    requestItems.current.length,
                );
                endIndex.current = Math.min(
                    endIndex.current + batchSize,
                    requestItems.current.length,
                );
            }
            const output = requestItems.current.slice(
                startIndex.current,
                endIndex.current,
            ).map((item) => item.request);
            return output;
        },
        [],
    );

    const update = useCallback(
        (
            merger: (
                oldValue: RequestItem<K, Req, Res, Err>,
                localIndex: number,
                index: number,
            ) => RequestItem<K, Req, Res, Err>,
        ) => {
            for (let i = startIndex.current; i < endIndex.current; i += 1) {
                const oldValue = requestItems.current[i];
                if (isDefined(oldValue)) {
                    requestItems.current[i] = merger(oldValue, i - startIndex.current, i);
                } else {
                    // eslint-disable-next-line no-console
                    console.error(`Element not found at ${i}`);
                }
            }
        },
        [],
    );

    const inspect = useCallback(
        () => requestItems.current,
        [],
    );

    return {
        inspect,
        init,
        pop,
        update,
        reset,
    };
}

export default useBatchManager;
