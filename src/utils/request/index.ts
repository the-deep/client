import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    useLayoutEffect,
} from 'react';
import ReactDOM from 'react-dom';

import { isTruthyString, isDefined } from '@togglecorp/fujs';
import AbortController from 'abort-controller';

import sleep from './sleep';
import { prepareUrlParams } from './utils';
import {
    UrlParams,
    Error,
    Err,
} from './types';
import RequestContext from './context';

import schema from '../../schema';

/* TODO:
1. Retry request with exponential backoff
*/

type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<T> {
    // TODO:
    // re-trigger if autoRetrigger
    url: string | undefined;
    query?: UrlParams;

    body?: RequestInit['body'];
    method?: Methods;
    other?: RequestInit;

    mockResponse?: T;

    // TODO: add this
    autoTrigger?: boolean;

    // NOTE:
    // don't ever retrigger
    schemaName?: string;
    delay?: number;
    preserveResponse?: boolean;
    shouldRetry?: (val: T, run: number) => number;
    shouldPoll?: (val: T | undefined) => number;
    onSuccess?: (val: T) => void;
    onFailure?: (val: Err) => void;
}

function isFetchable(
    url: string | undefined,
    method: Methods,
    body: RequestInit['body'] | undefined,
): url is string {
    return (
        isTruthyString(url)
        && (!['PUT', 'PATCH', 'POST'].includes(method) || isDefined(body))
    );
}

async function fetchResource<T>(
    myUrl: string,
    myOptions: RequestInit,
    delay: number,

    requestOptionsRef: React.MutableRefObject<Omit<RequestOptions<T>, 'url' | 'query' | 'method' | 'body' | 'other'>>,

    setPendingSafe: (value: boolean, clientId: number) => void,
    setResponseSafe: (value: T | undefined, clientId: number) => void,
    setErrorSafe: (value: Error | undefined, clientId: number) => void,
    callSideEffectSafe: (value: () => void, clientId: number) => void,

    myController: AbortController,
    clientId: number,
    run = 1,
) {
    const { signal } = myController;
    await sleep(delay, { signal });

    async function handlePoll(pollTime: number) {
        await sleep(pollTime, { signal });

        await fetchResource(
            myUrl,
            myOptions,
            delay,

            requestOptionsRef,

            setPendingSafe,
            setResponseSafe,
            setErrorSafe,
            callSideEffectSafe,

            myController,
            clientId, // NOTE: may not need to increase clientId
            1, // NOTE: run should be reset
        );
    }

    async function handleError(message: Error) {
        const { shouldPoll } = requestOptionsRef.current;
        const pollTime = shouldPoll ? shouldPoll(undefined) : -1;

        if (pollTime > 0) {
            await handlePoll(pollTime);
        } else {
            ReactDOM.unstable_batchedUpdates(() => {
                setPendingSafe(false, clientId);
                setResponseSafe(undefined, clientId);
                setErrorSafe(message, clientId);
            });
            const { onFailure } = requestOptionsRef.current;
            if (onFailure) {
                callSideEffectSafe(() => {
                    onFailure(message.value);
                }, clientId);
            }
        }
    }

    let res;
    try {
        res = await fetch(myUrl, { ...myOptions, signal });
    } catch (e) {
        if (!signal.aborted) {
            console.error(`An error occurred while fetching ${myUrl}`, e);
        }
        const message = {
            reason: 'network',
            exception: e,
            value: { nonFieldErrors: ['Network error'] },
        };
        handleError(message);
        return;
    }

    let resBody: unknown;
    try {
        const resText = await res.text();
        if (resText.length > 0) {
            resBody = JSON.parse(resText);
        }
    } catch (e) {
        const message = {
            reason: 'parse',
            exception: e,
            value: { nonFieldErrors: ['JSON parse error'] },
        };
        handleError(message);
        return;
    }

    if (!res.ok) {
        const message = {
            reason: 'other',
            exception: undefined,
            value: (resBody as { errors: Err }).errors,
        };
        handleError(message);
        return;
    }

    const { schemaName, shouldRetry, shouldPoll } = requestOptionsRef.current;
    if (schemaName && myOptions.method !== 'DELETE') {
        try {
            schema.validate(resBody, schemaName);
        } catch (e) {
            console.error(myUrl, myOptions.method, resBody, e.message);
        }
    }

    const retryTime = shouldRetry ? shouldRetry(resBody as T, run) : -1;
    if (retryTime >= 0) {
        await sleep(retryTime, { signal });
        await fetchResource(
            myUrl,
            myOptions,
            delay,

            requestOptionsRef,

            setPendingSafe,
            setResponseSafe,
            setErrorSafe,
            callSideEffectSafe,

            myController,
            clientId,
            run + 1,
        );
        return;
    }

    const pollTime = shouldPoll ? shouldPoll(resBody as T) : -1;
    ReactDOM.unstable_batchedUpdates(() => {
        if (pollTime < 0) {
            setPendingSafe(false, clientId);
        }
        setErrorSafe(undefined, clientId);
        setResponseSafe(resBody as T, clientId);
    });

    const { onSuccess } = requestOptionsRef.current;
    if (onSuccess) {
        callSideEffectSafe(() => {
            onSuccess(resBody as T);
        }, clientId);
    }

    if (pollTime >= 0) {
        handlePoll(pollTime);
    }
}

function useRequest<T>(
    requestOptions: RequestOptions<T>,
): [boolean, T | undefined, Err | undefined, () => void] {
    const {
        transformOptions,
        transformUrl,
    } = useContext(RequestContext);

    // NOTE: forgot why the clientId is required but it is required
    const clientIdRef = useRef<number>(-1);
    const pendingSetByRef = useRef<number>(-1);
    const responseSetByRef = useRef<number>(-1);
    const errorSetByRef = useRef<number>(-1);

    // NOTE: let's not add transformOptions as dependency
    const requestOptionsRef = useRef(requestOptions);
    const transformOptionsRef = useRef(transformOptions);
    const transformUrlRef = useRef(transformUrl);

    const {
        autoTrigger = false,
    } = requestOptions;

    // NOTE: timestamp is used to re-trigger fetch
    const [timestamp, setTimestamp] = useState(() => {
        if (autoTrigger) {
            return new Date().getTime();
        }
        return -1;
    });

    const [requestOptionsFromState, setRequestOptionsFromState] = useState(requestOptions);

    const {
        url,
        query,
        method = 'GET',
        body,
        other,
    } = autoTrigger ? requestOptions : requestOptionsFromState;

    const urlQuery = query ? prepareUrlParams(query) : undefined;
    const extendedUrl = url && urlQuery ? `${url}?${urlQuery}` : url;

    // NOTE: the initial value is the condition to fetch a url
    const [pending, setPending] = useState(() => (
        timestamp >= 0 && isFetchable(extendedUrl, method, body)
    ));
    const [response, setResponse] = useState<T | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const setPendingSafe = useCallback(
        (value: boolean, clientId: number) => {
            if (clientId >= pendingSetByRef.current) {
                pendingSetByRef.current = clientId;
                setPending(value);
            }
        },
        [],
    );
    const setResponseSafe = useCallback(
        (value: T | undefined, clientId: number) => {
            if (clientId >= responseSetByRef.current) {
                responseSetByRef.current = clientId;
                setResponse(value);
            }
        },
        [],
    );

    const setErrorSafe = useCallback(
        (value: Error | undefined, clientId: number) => {
            if (clientId >= errorSetByRef.current) {
                errorSetByRef.current = clientId;
                setError(value);
            }
        },
        [],
    );

    const callSideEffectSafe = useCallback(
        (callback: () => void, clientId: number) => {
            if (clientId >= clientIdRef.current) {
                callback();
            }
        },
        [],
    );

    // TODO: make trigger take latest value from props
    const trigger = useCallback(
        () => {
            // NOTE: This is done to prevent race condition where request body
            // is not modified before request is triggered
            setTimeout(() => {
                ReactDOM.unstable_batchedUpdates(() => {
                    setTimestamp(new Date().getTime());
                    setRequestOptionsFromState(requestOptionsRef.current);
                });
            }, 0);
        },
        [],
    );

    useLayoutEffect(
        () => {
            transformOptionsRef.current = transformOptions;
        },
        [transformOptions],
    );
    useLayoutEffect(
        () => {
            transformUrlRef.current = transformUrl;
        },
        [transformUrl],
    );
    useLayoutEffect(
        () => {
            requestOptionsRef.current = requestOptions;
        },
        [requestOptions],
    );
    useEffect(
        () => {
            const { mockResponse } = requestOptionsRef.current;
            if (mockResponse) {
                if (timestamp < 0 || !isFetchable(extendedUrl, method, body)) {
                    return () => {};
                }
                clientIdRef.current += 1;

                setResponseSafe(mockResponse, clientIdRef.current);
                setErrorSafe(undefined, clientIdRef.current);
                setPendingSafe(false, clientIdRef.current);

                const { onSuccess } = requestOptionsRef.current;
                if (onSuccess) {
                    callSideEffectSafe(() => {
                        onSuccess(mockResponse);
                    }, clientIdRef.current);
                }
                return () => {};
            }

            if (timestamp < 0 || !isFetchable(extendedUrl, method, body)) {
                setResponseSafe(undefined, clientIdRef.current);
                setErrorSafe(undefined, clientIdRef.current);
                setPendingSafe(false, clientIdRef.current);
                return () => {};
            }
            const {
                schemaName,
                preserveResponse,
                delay = 0,
            } = requestOptionsRef.current;

            if (!preserveResponse) {
                setResponseSafe(undefined, clientIdRef.current);
                setErrorSafe(undefined, clientIdRef.current);
            }

            clientIdRef.current += 1;

            setPendingSafe(true, clientIdRef.current);

            const controller = new AbortController();

            const transformedUrl = transformUrlRef.current(extendedUrl);
            const transformedOptions = transformOptionsRef.current(extendedUrl, {
                ...other,
                method,
                body,
            });

            if (method !== 'DELETE' && !schemaName) {
                console.error(`Schema is not defined for ${transformedUrl} ${method}`);
            }

            fetchResource(
                transformedUrl,
                transformedOptions,
                delay,

                requestOptionsRef,

                setPendingSafe,
                setResponseSafe,
                setErrorSafe,
                callSideEffectSafe,

                controller,
                clientIdRef.current,
            );

            return () => {
                controller.abort();
            };
        },
        [
            extendedUrl, method, body, other,
            setPendingSafe, setResponseSafe, setErrorSafe, callSideEffectSafe,
            timestamp,
        ],
    );

    return [pending, response, error?.value, trigger];
}
export default useRequest;
export { RequestContext };
