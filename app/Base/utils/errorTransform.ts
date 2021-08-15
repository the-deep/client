import { listToMap, isDefined, isNotDefined } from '@togglecorp/fujs';

type BaseError = {
    $internal: string | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    fields: object;
};

type ArrayBaseError = {
    $internal: string | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-types
    members: object;
};

export interface ObjectError {
    field: string;
    messages?: string;
    objectErrors?: ObjectError[];
    arrayErrors?: ArrayError[];
}

interface ArrayError {
    key: string;
    messages?: string;
    objectErrors?: ObjectError[];
}

function transformObject(errors: ObjectError[] | undefined): BaseError | undefined {
    if (isNotDefined(errors)) {
        return undefined;
    }

    const topLevelError = errors.find((error) => error.field === 'nonFieldErrors');
    const fieldErrors = errors.filter((error) => error.field !== 'nonFieldErrors');

    return {
        $internal: topLevelError?.messages,
        fields: listToMap(
            fieldErrors,
            (error) => error.field,
            (error) => {
                if (isDefined(error.messages)) {
                    return error.messages;
                }
                let objectErrors;
                if (isDefined(error.objectErrors)) {
                    objectErrors = transformObject(error.objectErrors);
                }
                let arrayErrors;
                if (isDefined(error.arrayErrors)) {
                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                    arrayErrors = transformArray(error.arrayErrors);
                }
                if (!objectErrors && !arrayErrors) {
                    return undefined;
                }
                return { ...objectErrors, ...arrayErrors };
            },
        ),
    };
}

function transformArray(errors: ArrayError[] | undefined): ArrayBaseError | undefined {
    if (isNotDefined(errors)) {
        return undefined;
    }

    const topLevelError = errors.find((error) => error.key === 'nonMemberErrors');
    const memberErrors = errors.filter((error) => error.key !== 'nonMemberErrors');

    return {
        $internal: topLevelError?.messages,
        members: listToMap(
            memberErrors,
            (error) => error.key,
            (error) => transformObject(error.objectErrors),
        ),
    };
}

export const transformToFormError = transformObject;

// const errors: ObjectError[] = <get_from_server>;
