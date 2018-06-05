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
export * from './discoverProjects';
export * from './docs';
export * from './entries';
export * from './entryFilterOptions';
export * from './export';
export * from './external';
export * from './file';
export * from './languages';
export * from './leadFilterOptions';
export * from './leads';
export * from './projects';
export * from './regions';
export * from './token';
export * from './userGroups';
export * from './users';

export const createParamsForGet = () => ({
    method: GET,
    headers: commonHeaderForGet,
});

export const createParamsForDelete = () => ({
    method: DELETE,
    header: commonHeaderForPost,
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
    const { nonFieldErrors = [], ...formFieldErrorList } = errors;

    return Object.keys(formFieldErrorList).reduce(
        (acc, key) => {
            acc[key] = formFieldErrorList[key].join(' ');
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
