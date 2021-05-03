import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useContext,
    useLayoutEffect,
} from 'react';
import ReactDOM from 'react-dom';
import { isDefined } from '@togglecorp/fujs';

import AbortController from 'abort-controller';

import { prepareUrlParams, isFetchable, Methods } from './utils';
import {
    UrlParams,
    Error,
} from './types';
import RequestContext from './context';
import fetchResource, { RequestOptions as NonTriggerFetchOptions } from './fetch';

type Callable<Q, T> = T | ((value: Q) => T);

function isCallable<Q, T>(value: Callable<Q, T>): value is ((value: Q) => T) {
    return typeof value === 'function';
}

function resolveCallable<Q, T>(value: Callable<Q, T>, context: Q | undefined) {
    if (isCallable(value)) {
        return isDefined(context) ? value(context) : undefined;
    }
    return value;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type RequestBody = RequestInit['body'] | object;

interface LazyRequestOptions<T, Q> extends NonTriggerFetchOptions<T> {
    url: Callable<Q, string | undefined>;
    query?: Callable<Q, UrlParams | undefined>;
    body?: Callable<Q, RequestBody | undefined>;
    method?: Callable<Q, Methods | undefined>;
    other?: Callable<Q, Omit<RequestInit, 'body'> | undefined>;

    // NOTE: don't ever re-trigger
    mockResponse?: T;
    delay?: number;
    preserveResponse?: boolean;
}

function useLazyRequest<T, Q>(
    requestOptions: LazyRequestOptions<T, Q>,
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

    const [requestOptionsFromState, setRequestOptionsFromState] = useState(requestOptions);

    const [response, setResponse] = useState<T | undefined>();
    const [error, setError] = useState<Error | undefined>();

    const [pending, setPending] = useState(false);

    const [runId, setRunId] = useState(-1);

    const [context, setContext] = useState<Q | undefined>();

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

    const {
        url: rawUrl,
        query: rawQuery,
        method: rawMethod,
        body: rawBody,
        other: rawOther,
    } = requestOptionsFromState;

    const query = resolveCallable(rawQuery, context);
    const url = resolveCallable(rawUrl, context);
    const body = resolveCallable(rawBody, context);
    const method = resolveCallable(rawMethod, context) ?? 'GET';
    const other = resolveCallable(rawOther, context);

    const urlQuery = query ? prepareUrlParams(query) : undefined;
    const extendedUrl = url && urlQuery ? `${url}?${urlQuery}` : url;

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

    const trigger = useCallback(
        (ctx: Q) => {
            ReactDOM.unstable_batchedUpdates(() => {
                setRunId(new Date().getTime());
                setContext(ctx);
                setRequestOptionsFromState(requestOptionsRef.current);
            });
        },
        [],
    );

    return {
        response,
        pending,
        error: error?.value,
        trigger,
    };
}
export default useLazyRequest;
