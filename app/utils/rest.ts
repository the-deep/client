import {
    internal,
} from '@togglecorp/toggle-form';
import {
    listToMap,
    mapToMap,
    doesObjectHaveNoData,
    isNotDefined,
    isDefined,
} from '@togglecorp/fujs';

/* eslint-disable  @typescript-eslint/no-explicit-any */
function transform(formSchema: any, responseValue: any, responseError: any) {
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

        const errorList = responseError.map((error: any, i: any) => {
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
            (error: any) => error.key,
            (error: any) => error.transformedValue,
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
        const errorMap: any = mapToMap(
            otherErrors,
            (key) => key,
            (err, key) => {
                const localSchema = objectSchema?.[key];
                const valueItem = responseValue?.[key];

                const transformedValue: any = transform(
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
export function transformErrorToToggleFormError(formSchema: any, obj: any, responseError: any) {
    try {
        return transform(formSchema, obj, responseError);
    } catch {
        // eslint-disable-next-line no-console
        console.error('Error while transforming server response');
        return undefined;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
