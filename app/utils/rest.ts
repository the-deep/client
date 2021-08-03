import {
    listToMap,
    mapToMap,
    doesObjectHaveNoData,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';

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
            (error) => error.key,
            (error) => error.transformedValue,
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
            (key) => key,
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

// eslint-disable-next-line import/prefer-default-export
export function transformErrorToToggleFormError(formSchema, obj, responseError) {
    try {
        return transform(formSchema, obj, responseError);
    } catch {
        console.error('Error while transforming server response');
        return undefined;
    }
}
