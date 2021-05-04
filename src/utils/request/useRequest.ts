import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    useLayoutEffect,
} from 'react';

import AbortController from 'abort-controller';

import { prepareUrlParams, isFetchable, Methods } from './utils';
import {
    UrlParams,
    Error,
} from './types';
import RequestContext from './context';
import fetchResource, { RequestOptions as NonTriggerFetchOptions } from './fetch';

// eslint-disable-next-line @typescript-eslint/ban-types
type RequestBody = RequestInit['body'] | object;

interface RequestOptions<T> extends NonTriggerFetchOptions<T> {
    // NOTE: disabling will cancel on-going requests
    skip?: boolean;

    url: string | undefined;
    query?: UrlParams;
    body?: RequestBody;
    method?: Methods;
    other?: Omit<RequestInit, 'body'>;

    // NOTE: don't ever re-trigger
    delay?: number;
    mockResponse?: T;
    preserveResponse?: boolean;
}

function useRequest<T>(
    requestOptions: RequestOptions<T>,
) {
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

    const { skip = false } = requestOptions;

    const {
        url,
        query,
        method = 'GET',
        body,
        other,
    } = requestOptions;

    const urlQuery = query ? prepareUrlParams(query) : undefined;
    const extendedUrl = url && urlQuery ? `${url}?${urlQuery}` : url;


    const [response, setResponse] = useState<T | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const [runId, setRunId] = useState(() => (
        skip ? -1 : new Date().getTime()
    ));

    const [pending, setPending] = useState(() => (
        runId >= 0 && isFetchable(extendedUrl, method, body)
    ));

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

    // To re-trigger request when skip changes
    useEffect(
        () => {
            setRunId(skip ? -1 : new Date().getTime());
        },
        [skip],
    );

    useEffect(
        () => {
            const { mockResponse } = requestOptionsRef.current;
            if (mockResponse) {
                if (runId < 0 || !isFetchable(extendedUrl, method, body)) {
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

            if (runId < 0 || !isFetchable(extendedUrl, method, body)) {
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

            if (method !== 'DELETE' && !schemaName) {
                console.error(`Schema is not defined for ${extendedUrl} ${method}`);
            }

            fetchResource(
                extendedUrl,
                {
                    ...other,
                    method,
                    // FIXME: here object is explicitly cast as BodyInit
                    body: body as (BodyInit | null | undefined),
                },
                delay,

                transformUrlRef,
                transformOptionsRef,
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
            runId,
        ],
    );

    const retrigger = useCallback(
        () => {
            setRunId(skip ? -1 : new Date().getTime());
        },
        [skip],
    );

    return {
        response,
        pending,
        error: error?.value,
        retrigger,
    };
}
export default useRequest;
