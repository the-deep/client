import { isDefined, isNotDefined } from '@togglecorp/fujs';

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
