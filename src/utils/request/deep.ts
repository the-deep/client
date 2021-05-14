import { mapToMap } from '@togglecorp/fujs';
import { serverlessEndpoint, wsEndpoint, getVersionedUrl } from '#config/rest';

import { ContextInterface } from './context';
import schema from '../../schema';

export interface Error {
    reason: string;
    // exception: any;
    value: {
        faramErrors: {
            [key: string]: string | undefined;
        },
        messageForNotification: string,
    };
    errorCode: number | undefined;
}

interface ErrorFromServer {
    errorCode?: number;
    errors: {
        // NOTE: it is most probably only string[]
        [key: string]: string[] | string;
    };
}

function alterResponse(errors: ErrorFromServer['errors']): Error['value']['faramErrors'] {
    const otherErrors = mapToMap(
        errors,
        item => item,
        item => (Array.isArray(item) ? item.join(' ') : item),
    );
    return otherErrors;
}

interface OptionBase {
    schemaName?: string;
}

type DeepContextInterface = ContextInterface<
    // eslint-disable-next-line @typescript-eslint/ban-types
    object,
    ErrorFromServer,
    Error,
    OptionBase
>;

const serverPrefix = 'server://';
const serverlessPrefix = 'serverless://';
export const processDeepUrls: DeepContextInterface['transformUrl'] = (url) => {
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
};

export const processDeepOptions = (access: string | undefined) => {
    const callback: DeepContextInterface['transformOptions'] = (
        url,
        options,
    ) => {
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
                    : '',
                'Content-Type': 'application/json; charset=utf-8',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
            ...otherOptions,
        };
    };
    return callback;
};

export const processDeepResponse: DeepContextInterface['transformBody'] = async (
    res,
    url,
    options,
    ctx: { schemaName?: string },
) => {
    const resText = await res.text();
    if (resText.length > 0) {
        const json = JSON.parse(resText);

        const { schemaName } = ctx;
        if (schemaName && options.method !== 'DELETE') {
            try {
                schema.validate(json, schemaName);
            } catch (e) {
                console.error(url, options.method, json, e.message);
            }
        }
        return json;
    }
    return undefined;
};

export const processDeepError: DeepContextInterface['transformError'] = (res) => {
    if (res === 'network') {
        return {
            reason: 'network',
            // exception: e,
            value: {
                messageForNotification: 'Network error',
                faramErrors: {
                    $internal: 'Network error',
                },
            },
            errorCode: undefined,
        };
    }
    if (res === 'parse') {
        return {
            reason: 'parse',
            // exception: e,
            value: {
                messageForNotification: 'Response parse error',
                faramErrors: {
                    $internal: 'Response parse error',
                },
            },
            errorCode: undefined,
        };
    }

    const faramErrors = alterResponse(res.errors);

    const messageForNotification = (
        faramErrors?.$internal
        ?? 'Some error occurred while performing this action.'
    );

    const requestError = {
        faramErrors,
        messageForNotification,
    };

    return {
        reason: 'server',
        value: requestError,
        errorCode: res.errorCode,
    };
};
