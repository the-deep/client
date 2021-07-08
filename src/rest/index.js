import {
    GET,
    DELETE,
    commonHeaderForGet,
    commonHeaderForPost,
} from '#config/rest';
import {
    listToMap,
    mapToMap,
    doesObjectHaveNoData,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';
import {
    internal,
} from '@togglecorp/toggle-form';

export * from './analysisFramework';
export * from './assessmentRegistry';
export * from './categoryEditor';
export * from './connectors';
export * from './entries';
export * from './export';
export * from './external';
export * from './file';
export * from './languages';
export * from './leadGroups';
export * from './leads';
export * from './notifications';
export * from './projects';
export * from './regions';
export * from './tabular';
export * from './token';
export * from './userGroups';
export * from './users';

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const createParamsForDelete = () => ({
    method: DELETE,
    headers: commonHeaderForPost,
});

// FIXME: remove this
export const transformResponseErrorToFormError = (errors) => {
    const { nonFieldErrors = [], ...formFieldErrorList } = errors;

    const formErrors = {
        errors: nonFieldErrors,
    };
    const formFieldErrors = Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
            return acc;
        },
        {},
    );
    return { formFieldErrors, formErrors };
};

// FIXME: remove this
export const transformAndCombineResponseErrors = (errors) => {
    const transformedErrors = transformResponseErrorToFormError(errors);
    return [
        ...transformedErrors.formErrors.errors,
        ...Object.values(transformedErrors.formFieldErrors),
    ];
};

export const alterResponseErrorToFaramError = (errors) => {
    const {
        nonFieldErrors = [],
        ...formFieldErrors
    } = errors;

    return Object.keys(formFieldErrors).reduce(
        (acc, key) => {
            const error = formFieldErrors[key];
            acc[key] = Array.isArray(error) ? error.join(' ') : error;
            return acc;
        },
        {
            $internal: nonFieldErrors,
        },
    );
};

export const alterAndCombineResponseError = errors => (
    Object.values(alterResponseErrorToFaramError(errors))
);

// NOTE: the functions below are generic transformers to
// transform server error to form error

function transform(formSchema, responseValue, responseError) {
    if (!formSchema || !responseError) {
        return undefined;
    }

    if (Array.isArray(formSchema)) {
        if (responseError.length <= 0) {
            return undefined;
        }
        return responseError.join(' ');
    }

    if (formSchema.member && formSchema.keySelector) {
        // FIXME: there may be a case where the error can be similar to leaf

        const errorList = responseError.map((error, i) => {
            if (!error) {
                return undefined;
            }

            const valueItem = responseValue?.[i];
            if (isNotDefined(valueItem)) {
                return undefined;
            }

            const key = formSchema.keySelector(valueItem);
            const localSchema = formSchema.member(valueItem);

            const transformedValue = transform(
                localSchema,
                valueItem,
                error,
            );
            return { key, transformedValue };
        }).filter(isDefined);

        const errorMap = listToMap(
            errorList,
            error => error.key,
            error => error.transformedValue,
        );

        return doesObjectHaveNoData(errorMap)
            ? undefined
            : errorMap;
    }

    if (formSchema.fields) {
        const objectSchema = formSchema.fields(responseValue);

        // FIXME: how does this map with array error?
        const {
            nonFieldErrors,
            ...otherErrors
        } = responseError;

        // FIXME: there may be a case where the error can be similar to leaf

        const errorMap = mapToMap(
            otherErrors,
            key => key,
            (err, key) => {
                const localSchema = objectSchema?.[key];
                const valueItem = responseValue?.[key];

                const transformedValue = transform(
                    localSchema,
                    valueItem,
                    err,
                );
                return transformedValue;
            },
        );
        if (nonFieldErrors) {
            errorMap[internal] = nonFieldErrors.join(' ');
        }
        return doesObjectHaveNoData(errorMap)
            ? undefined
            : errorMap;
    }
    return undefined;
}

export function transformErrorToToggleFormError(formSchema, obj, responseError) {
    try {
        return transform(formSchema, obj, responseError);
    } catch {
        console.error('Error while transforming server response');
        return undefined;
    }
}
