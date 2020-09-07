import {
    useState,
    useEffect,
    useRef,
    useCallback,
    createContext,
    useContext,
    useLayoutEffect,
} from 'react';
import { isFalsyString, isDefined, isNotDefined } from '@togglecorp/fujs';
import AbortController from 'abort-controller';

import schema from './schema';

// Example Promise, which takes signal into account
function sleep(delay: number, { signal }: { signal: AbortSignal }): Promise<string> {
    if (signal.aborted) {
        return Promise.reject(new DOMException('aborted', 'AbortError'));
    }

    if (delay <= 0) {
        return Promise.resolve('resolved');
    }

    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(resolve, delay, 'resolved');

        signal.addEventListener('abort', () => {
            window.clearTimeout(timeout);
            reject(new DOMException('aborted', 'AbortError'));
        });
    });
}

/* TODO:
1. Accept callback for completed and failed
2. Poll request until certain condition is met
3. Retry request with exponential backoff
*/

export type Maybe<T> = T | null | undefined;

export interface UrlParams {
    [key: string]: Maybe<string | number | boolean | (string | number | boolean)[]>;
}

export function prepareUrlParams(params: UrlParams): string {
    return Object.keys(params)
        .filter(k => isDefined(params[k]))
        .map((k) => {
            const param = params[k];
            if (isNotDefined(param)) {
                return undefined;
            }
            let val: string;
            if (Array.isArray(param)) {
                val = param.join(',');
            } else if (typeof param === 'number' || typeof param === 'boolean') {
                val = String(param);
            } else {
                val = param;
            }
            return `${encodeURIComponent(k)}=${encodeURIComponent(val)}`;
        })
        .filter(isDefined)
        .join('&');
}

interface ContextInterface {
    transformUrl: (props: string) => string;
    transformOptions: (props: RequestInit) => RequestInit;
}

const defaultContext: ContextInterface = {
    transformUrl: value => value,
    transformOptions: value => ({
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
        },
        ...value,
    }),
};

export const RequestContext = createContext(defaultContext);

interface Err {
    [key: string]: string[];
}

/*
export function alterResponseErrorToFaramError(errors: Err) {
    const {
        nonFieldErrors = [],
        ...formFieldErrors
    } = errors;

    const otherValues: {
        [key: string]: string | undefined;
    } = mapToMap(
        formFieldErrors,
        key => key,
        value => (Array.isArray(value) ? value.join(' ') : value),
    );

    return ({
        $internal: nonFieldErrors,
        ...otherValues,
    });
}
*/

interface Error {
    reason: string;
    exception: any;
    value: Err;
}

async function fetchResource<T>(
    schemaName: string,
    myUrl: string,
    myOptions: RequestInit,
    myController: AbortController,
    delay: number,
    setPendingSafe: (value: boolean, clientId: number) => void,
    setResponseSafe: (value: T | undefined, clientId: number) => void,
    setErrorSafe: (error: Error | undefined, clientId: number) => void,
    clientId: number,
) {
    const { signal } = myController;

    let res;
    try {
        await sleep(delay, { signal });
        res = await fetch(myUrl, { ...myOptions, signal });
    } catch (e) {
        if (!signal.aborted) {
            console.error(`An error occurred while fetching ${myUrl}`, e);
        }
        setPendingSafe(false, clientId);
        setResponseSafe(undefined, clientId);
        setErrorSafe({
            reason: 'network',
            exception: e,
            value: { nonFieldErrors: ['Network error'] },
        }, clientId);
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
        setErrorSafe({
            reason: 'parse',
            exception: e,
            value: { nonFieldErrors: ['JSON parse error'] },
        }, clientId);
        return;
    }

    setPendingSafe(false, clientId);
    if (res.ok) {
        if (schemaName && myOptions.method !== 'DELETE') {
            try {
                schema.validate(resBody, schemaName);
            } catch (e) {
                console.error(myUrl, myOptions.method, resBody, e.message);
            }
        }
        setResponseSafe(resBody as T, clientId);
        setErrorSafe(undefined, clientId);
    } else {
        setResponseSafe(undefined, clientId);
        setErrorSafe(
            {
                reason: 'other',
                exception: undefined,
                value: (resBody as { errors: Err }).errors,
            },
            clientId,
        );
    }
}

function useRequest<T>(
    options: {
        url: string | undefined,
        query?: UrlParams,
        method?: 'GET' | 'PUT' | 'PATCH' | 'DELETE',
        other?: RequestInit,
    } | undefined,
    schemaName: string,
    delay = 0,
    preserveResponse = true,
): [boolean, T | undefined, Err | undefined] {
    const [pending, setPending] = useState(!!options?.url);
    const [response, setResponse] = useState<T | undefined>();
    const [error, setError] = useState<Error | undefined>();

    // NOTE: forgot why the clientId is required but it is required
    const clientIdRef = useRef<number>(-1);
    const pendingSetByRef = useRef<number>(-1);
    const responseSetByRef = useRef<number>(-1);
    const errorSetByRef = useRef<number>(-1);

    const { transformOptions, transformUrl } = useContext(RequestContext);

    // NOTE: let's not add transformOptions as dependency
    const transformOptionsRef = useRef(transformOptions);
    useLayoutEffect(
        () => {
            transformOptionsRef.current = transformOptions;
        },
        [transformOptions],
    );
    const transformUrlRef = useRef(transformUrl);
    useLayoutEffect(
        () => {
            transformUrlRef.current = transformUrl;
        },
        [transformUrl],
    );

    const setPendingSafe = useCallback(
        (value: boolean, clientId) => {
            if (clientId >= pendingSetByRef.current) {
                pendingSetByRef.current = clientId;
                setPending(value);
            }
        },
        [],
    );
    const setResponseSafe = useCallback(
        (value: T | undefined, clientId) => {
            if (clientId >= responseSetByRef.current) {
                responseSetByRef.current = clientId;
                setResponse(value);
            }
        },
        [],
    );

    const setErrorSafe = useCallback(
        (value: Error | undefined, clientId) => {
            if (clientId >= errorSetByRef.current) {
                errorSetByRef.current = clientId;
                setError(value);
            }
        },
        [],
    );
    // NOTE: used for schema warning only
    useEffect(
        () => {
            if (options?.url && options?.method !== 'DELETE' && !schemaName) {
                console.error(`Schema is not defined for ${options?.url} ${options?.method}`);
            }
        },
        [options?.url, options?.method, schemaName],
    );

    const url = options?.url;
    const query = options?.query;

    const urlQuery = query ? prepareUrlParams(query) : undefined;
    const extendedUrl = url && urlQuery ? `${url}?${urlQuery}` : url;

    useEffect(
        () => {
            if (isFalsyString(extendedUrl)) {
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

            fetchResource(
                schemaName,
                transformUrlRef.current(extendedUrl),
                transformOptionsRef.current({
                    ...options?.other,
                    method: options?.method,
                }),
                controller,
                delay,
                setPendingSafe,
                setResponseSafe,
                setErrorSafe,
                clientIdRef.current,
            );

            return () => {
                controller.abort();
            };
        },
        [
            extendedUrl,
            options?.method,
            options?.other,

            schemaName,
            preserveResponse,
            delay,

            transformOptions,

            setPendingSafe,
            setResponseSafe,
            setErrorSafe,
        ],
    );

    return [pending, response, error?.value];
}
export default useRequest;
