import { isDefined, isNotDefined, isTruthyString } from '@togglecorp/fujs';
import { serverlessEndpoint, wsEndpoint, getVersionedUrl } from '#config/rest';

import { UrlParams } from './types';

// eslint-disable-next-line import/prefer-default-export
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

const serverPrefix = 'server://';
const serverlessPrefix = 'serverless://';
export function processDeepUrls(url: string) {
    if (url.startsWith(serverPrefix)) {
        // NOTE: -1 to leave out the starting slash
        const cleanedUrl = url.slice(serverPrefix.length - 1);
        return getVersionedUrl(wsEndpoint, cleanedUrl);
    } else if (url.startsWith(serverlessPrefix)) {
        // NOTE: -1 to leave out the starting slash
        const cleanedUrl = url.slice(serverlessPrefix.length - 1);
        return `${serverlessEndpoint}${cleanedUrl}`;
    } else if (/^https?:\/\//i.test(url)) {
        return url;
    }
    console.error('Url should start with http/https or a defined scope', url);
    return url;
}

export function processDeepOptions(url: string, options: RequestInit, access: string | undefined) {
    const {
        body,
        headers,
        ...otherOptions
    } = options;

    const isInternalRequest = url.startsWith(serverPrefix) || url.startsWith(serverlessPrefix);

    return {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: access && isInternalRequest
                ? `Bearer ${access}`
                : undefined,
            'Content-Type': 'application/json; charset=utf-8',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...otherOptions,
    };
}

export type Methods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export function isFetchable(
    url: string | undefined,
    method: Methods,
    // eslint-disable-next-line @typescript-eslint/ban-types
    body: RequestInit['body'] | object | undefined,
): url is string {
    return (
        isTruthyString(url)
        && (!['PUT', 'PATCH', 'POST'].includes(method) || isDefined(body))
    );
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
