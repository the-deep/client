import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    useLayoutEffect,
} from 'react';
import { isFalsyString, isNotDefined } from '@togglecorp/fujs';
import AbortController from 'abort-controller';

import sleep from './sleep';
import { prepareUrlParams } from './utils';
import {
    UrlParams,
    Error,
    Err,
} from './types';
import RequestContext from './context';

import schema from '../schema';

/* TODO:
1. Retry request with exponential backoff
*/

interface RequestOptions {
    // TODO:
    // re-trigger if autoRetrigger
    url: string | undefined,
    query?: UrlParams,

    body?: RequestInit['body'],

    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    other?: RequestInit,

    // TODO:
    // don't ever retrigger
    delay?: number;
    preserveResponse?: boolean;
}

// if auto-trigger then use direct values
// if not set values with do (get new values)

interface GeneralOptions<T> {
    // TODO: add this
    // autoTrigger?: boolean;
    schemaName?: string;

    shouldPoll?: (val: T) => number;
    onSuccess?: (val: T) => void;
    onFailure?: (val: Err) => void;
}

async function fetchResource<T>(
    myUrl: string,
    myOptions: RequestInit,
    delay: number,

    generalOptionsRef: React.MutableRefObject<GeneralOptions<T>>,

    setPendingSafe: (value: boolean, clientId: number) => void,
    setResponseSafe: (value: T | undefined, clientId: number) => void,
    setErrorSafe: (value: Error | undefined, clientId: number) => void,
    callSideEffectSafe: (value: () => void, clientId: number) => void,

    myController: AbortController,
    clientId: number,
) {
    const { signal } = myController;
    await sleep(delay, { signal });

    let res;
    try {
        res = await fetch(myUrl, { ...myOptions, signal });
    } catch (e) {
        if (!signal.aborted) {
            console.error(`An error occurred while fetching ${myUrl}`, e);
        }
        setPendingSafe(false, clientId);
        setResponseSafe(undefined, clientId);
        const message = {
            reason: 'network',
            exception: e,
            value: { nonFieldErrors: ['Network error'] },
        };
        setErrorSafe(message, clientId);
        const { onFailure } = generalOptionsRef.current;
        if (onFailure) {
            callSideEffectSafe(() => {
                onFailure(message.value);
            }, clientId);
        }
        return;
    }

    let resBody: unknown;
    try {
        const resText = await res.text();
        if (resText.length > 0) {
            resBody = JSON.parse(resText);
        }
    } catch (e) {
        // console.warn('Clearing response on parse error');
        setResponseSafe(undefined, clientId);
        setPendingSafe(false, clientId);
        console.error(`An error occurred while parsing data from ${myUrl}`, e);
        const message = {
            reason: 'parse',
            exception: e,
            value: { nonFieldErrors: ['JSON parse error'] },
        };
        setErrorSafe(message, clientId);
        const { onFailure } = generalOptionsRef.current;
        if (onFailure) {
            callSideEffectSafe(() => {
                onFailure(message.value);
            }, clientId);
        }
        return;
    }

    setPendingSafe(false, clientId);
    if (res.ok) {
        const { schemaName, shouldPoll } = generalOptionsRef.current;
        if (schemaName && myOptions.method !== 'DELETE') {
            try {
                schema.validate(resBody, schemaName);
            } catch (e) {
                console.error(myUrl, myOptions.method, resBody, e.message);
            }
        }

        const pollTime = shouldPoll ? shouldPoll(resBody as T) : -1;

        if (pollTime >= 0) {
            await sleep(pollTime, { signal });
            await fetchResource(
                myUrl,
                myOptions,
                delay,

                generalOptionsRef,

                setPendingSafe,
                setResponseSafe,
                setErrorSafe,
                callSideEffectSafe,

                myController,
                clientId,
            );
            return;
        }

        setErrorSafe(undefined, clientId);
        setResponseSafe(resBody as T, clientId);
        const { onSuccess } = generalOptionsRef.current;
        if (onSuccess) {
            callSideEffectSafe(() => {
                onSuccess(resBody as T);
            }, clientId);
        }
    } else {
        setResponseSafe(undefined, clientId);
        const message = {
            reason: 'other',
            exception: undefined,
            value: (resBody as { errors: Err }).errors,
        };
        setErrorSafe(
            message,
            clientId,
        );
        const { onFailure } = generalOptionsRef.current;
        if (onFailure) {
            callSideEffectSafe(() => {
                onFailure(message.value);
            }, clientId);
        }
    }
}

function useRequest<T>(
    requestOptions: RequestOptions,
    generalOptions: GeneralOptions<T> = {},
): [boolean, T | undefined, Err | undefined] {
    const {
        transformOptions,
        transformUrl,
    } = useContext(RequestContext);

    const {
        url,
        query,
        method = 'GET',
        body,
        other,
        delay = 0,
        preserveResponse = true,
    } = requestOptions;

    const [pending, setPending] = useState(!!url);
    const [response, setResponse] = useState<T | undefined>();
    const [error, setError] = useState<Error | undefined>();

    // NOTE: forgot why the clientId is required but it is required
    const clientIdRef = useRef<number>(-1);
    const pendingSetByRef = useRef<number>(-1);
    const responseSetByRef = useRef<number>(-1);
    const errorSetByRef = useRef<number>(-1);

    // NOTE: let's not add transformOptions as dependency
    const generalOptionsRef = useRef(generalOptions);
    const transformOptionsRef = useRef(transformOptions);
    const transformUrlRef = useRef(transformUrl);

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
            generalOptionsRef.current = generalOptions;
        },
        [generalOptions],
    );

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

    const urlQuery = query ? prepareUrlParams(query) : undefined;
    const extendedUrl = url && urlQuery ? `${url}?${urlQuery}` : url;

    useEffect(
        () => {
            if (
                isFalsyString(extendedUrl)
                || (['PUT', 'PATCH', 'POST'].includes(method) && isNotDefined(body))
            ) {
                setResponseSafe(undefined, clientIdRef.current);
                setErrorSafe(undefined, clientIdRef.current);
                setPendingSafe(false, clientIdRef.current);
                return () => {};
            }

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

            const { schemaName } = generalOptionsRef.current;
            if (method !== 'DELETE' && !schemaName) {
                console.error(`Schema is not defined for ${transformedUrl} ${method}`);
            }

            fetchResource(
                transformedUrl,
                transformedOptions,
                delay,

                generalOptionsRef,

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
            extendedUrl, method, body, other, preserveResponse, delay,
            transformOptions,
            setPendingSafe, setResponseSafe, setErrorSafe, callSideEffectSafe,
        ],
    );

    return [pending, response, error?.value];
}
export default useRequest;
export { RequestContext };
