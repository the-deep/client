import {
    GET,
    DELETE,
    commonHeaderForGet,
    commonHeaderForPost,
} from '#config/rest';

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
