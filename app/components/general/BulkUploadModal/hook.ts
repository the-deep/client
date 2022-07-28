import { useState, useCallback } from 'react';
import { listToMap } from '@togglecorp/fujs';
import {
    useAlert,
} from '@the-deep/deep-ui';
import {
    useForm,
    useFormArray,
    SetValueArg,
    isCallable,
    // createSubmitHandler,
    getErrorObject,
    removeNull,
    Error,
} from '@togglecorp/toggle-form';
import produce from 'immer';
import { gql, useMutation } from '@apollo/client';

import {
    BulkCreateLeadsMutation,
    BulkCreateLeadsMutationVariables,
    LeadInputType,
} from '#generated/types';
import useBatchManager, { filterFailed, filterCompleted, RequestItem } from '#hooks/useBatchManager';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    schema,
    PartialFormType,
    PartialLeadType,
    defaultFormValues,
} from './schema';

type ValidateFunc<T> = (accumulateOnError?: boolean) => (
    { errored: true, error: Error<T>, value: unknown }
    | { errored: false, value: T, error: undefined }
);

// NOTE: we are using custom createSubmitHandler to get access to value on setError argument
function createSubmitHandler<T>(
    validator: ValidateFunc<T>,
    setError: (errors: Error<T> | undefined, value: unknown) => void,
    successCallback: (value: T) => void,
    failureCallback?: (value: unknown, errors: Error<T>) => void,
) {
    // NOTE: making event non-mandatory so that it can be used in other usecases
    return (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // NOTE: accumulating value if failureCallback is defined
        const value = validator(!!failureCallback);
        // NOTE: Idk why !value.errored doesn't work here
        if (value.errored === false) {
            setError(value.error, value.value);
            successCallback(value.value);
        } else if (failureCallback) {
            setError(value.error, value.value);
            failureCallback(value.value, value.error);
        }
    };
}

const BULK_CREATE_LEADS = gql`
    mutation BulkCreateLeads($projectId:ID!, $leads: [BulkLeadInputType!]) {
        project(id: $projectId) {
            leadBulk(items: $leads) {
                errors
                result {
                    id
                    clientId
                }
            }
        }
    }
`;

export type Req = NonNullable<BulkCreateLeadsMutationVariables['leads']>[number];
export type Res = NonNullable<NonNullable<NonNullable<NonNullable<BulkCreateLeadsMutation['project']>['leadBulk']>['result']>[number]>;
export type Err = NonNullable<NonNullable<NonNullable<NonNullable<BulkCreateLeadsMutation['project']>['leadBulk']>['errors']>[number]>;

export function useBulkLeads(
    projectId: string,
    onComplete: (value: RequestItem<string, Req, Res, Err>[]) => void,
    leadsFilter?: (value: PartialLeadType) => boolean,
) {
    // NOTE: handling bulkUpdateLeadsPending because we are making another
    // request after one completes. This avoids loading flickers
    const [bulkUpdateLeadsPending, setBulkUpdateLeadsPending] = useState(false);

    const {
        inspect,
        init,
        reset,
        pop,
        update,
    } = useBatchManager<string, Req, Res, Err>();

    const alert = useAlert();

    const {
        value: formValue,
        error: formError,
        validate: formValidate,
        setFieldValue: setFormFieldValue,
        setError: setFormError,
        pristine: formPristine,
    } = useForm(schema, defaultFormValues);

    const {
        setValue: onLeadChange,
    } = useFormArray<'leads', PartialLeadType>('leads', setFormFieldValue);

    const handleBulkActionsCompletion = useCallback(
        () => {
            const requests = inspect();

            const failedLeads = requests
                .filter(filterFailed)
                .map((item) => ({
                    clientId: item.key,
                    error: transformToFormError(removeNull(item.error) as ObjectError[]),
                }));
            const failedLeadsMapping = listToMap(
                failedLeads,
                (item) => item.clientId,
                (item) => item.error,
            );
            setFormError((oldError) => {
                const err = getErrorObject(oldError);
                return {
                    ...err,
                    leads: {
                        ...getErrorObject(err?.leads),
                        ...failedLeadsMapping,
                    },
                };
            });

            const completedLeads = requests
                .filter(filterCompleted)
                .map((item) => item.key);

            const completedLeadsMapping = listToMap(
                completedLeads,
                (key) => key,
                () => true,
            );
            setFormFieldValue((oldValues) => (
                oldValues?.filter((lead) => !completedLeadsMapping[lead.clientId])
            ), 'leads');

            const completedLeadsCount = completedLeads.length;
            if (completedLeadsCount > 0) {
                alert.show(
                    `Successfully added ${completedLeadsCount} sources!`,
                    { variant: 'success' },
                );
            }
            const failedLeadsCount = requests.length - completedLeadsCount;
            if (failedLeadsCount > 0) {
                alert.show(
                    `Failed to add ${failedLeadsCount} sources!`,
                    { variant: 'error' },
                );
            }

            reset();

            onComplete(requests);
        },
        [inspect, reset, alert, setFormError, setFormFieldValue, onComplete],
    );

    const [
        bulkCreateLeads,
    ] = useMutation<BulkCreateLeadsMutation, BulkCreateLeadsMutationVariables>(
        BULK_CREATE_LEADS,
        {
            onCompleted: (response) => {
                const leadBulk = response.project?.leadBulk;
                if (!leadBulk) {
                    setBulkUpdateLeadsPending(false);
                    handleBulkActionsCompletion();
                    return;
                }

                const {
                    errors,
                    result,
                } = leadBulk;

                update((oldValue, index) => {
                    const individualResult = result?.[index];
                    const individualError = errors?.[index];

                    if (individualResult) {
                        return {
                            key: oldValue.key,
                            request: oldValue.request,
                            status: 'completed',
                            response: individualResult,
                        };
                    }
                    if (individualError) {
                        return {
                            key: oldValue.key,
                            request: oldValue.request,
                            status: 'failed',
                            error: individualError,
                        };
                    }
                    return oldValue;
                });

                const remainingLeads = pop();
                if (remainingLeads.length <= 0) {
                    setBulkUpdateLeadsPending(false);
                    handleBulkActionsCompletion();
                    return;
                }

                bulkCreateLeads({
                    variables: {
                        projectId,
                        leads: remainingLeads,
                    },
                });
            },
            onError: () => {
                setBulkUpdateLeadsPending(false);
                handleBulkActionsCompletion();
            },
        },
    );

    const handleLeadChange = useCallback(
        (val: SetValueArg<PartialLeadType>, otherName: number | undefined) => {
            onLeadChange(
                (oldValue) => {
                    const newVal = !isCallable(val)
                        ? val
                        : val(oldValue);
                    return newVal;
                },
                otherName,
            );
        },
        [onLeadChange],
    );

    const handleLeadRemove = useCallback(
        (clientId: string) => {
            setFormFieldValue((oldVal) => oldVal?.filter(
                (lead) => lead.clientId !== clientId,
            ), 'leads');
        },
        [setFormFieldValue],
    );

    const handleSubmit = useCallback(
        () => {
            if (!projectId) {
                return;
            }

            const handleSubmission = (leadsToSubmit: LeadInputType[]) => {
                init(
                    leadsToSubmit,
                    (item) => item.clientId as string,
                );

                const initialLeads = pop();

                if (initialLeads.length <= 0) {
                    reset();
                    return;
                }

                setBulkUpdateLeadsPending(true);
                bulkCreateLeads({
                    variables: {
                        projectId,
                        leads: initialLeads,
                    },
                });
            };

            const submit = createSubmitHandler<PartialFormType>(
                formValidate,
                (error, value) => {
                    // NOTE: this will not actually change the error object in the last argument
                    const newError = produce(error, (safeError) => {
                        if (
                            leadsFilter
                            && safeError && typeof safeError !== 'string'
                            && safeError.leads && typeof safeError.leads !== 'string'
                        ) {
                            const newErrorLeads = safeError.leads;

                            const { leads } = (value as PartialFormType);
                            leads?.forEach((lead) => {
                                const valid = leadsFilter(lead);
                                if (!valid) {
                                    delete newErrorLeads[lead.clientId];
                                }
                            });
                        }
                    });
                    setFormError(newError);
                },
                (value) => {
                    // FIXME: send request even if there are errors on some requests
                    const leadsToSubmit = value.leads ?? [];

                    const finalLeads = leadsFilter
                        ? leadsToSubmit.filter(leadsFilter)
                        : leadsToSubmit;

                    handleSubmission(finalLeads as LeadInputType[]);
                },
                (value, riskyError) => {
                    const error = getErrorObject(riskyError);
                    const leadsError = getErrorObject(error?.leads);
                    const typedValue = value as (PartialFormType | undefined);

                    const finalLeads = leadsFilter
                        ? typedValue?.leads?.filter(leadsFilter)
                        : typedValue?.leads;

                    const validLeads = finalLeads?.filter(
                        (lead) => !leadsError?.[lead.clientId],
                    );

                    const errorCount = (finalLeads?.length ?? 0) - (validLeads?.length ?? 0);
                    if (errorCount > 0) {
                        alert.show(
                            `Validation errors for ${errorCount} sources!`,
                            { variant: 'error' },
                        );
                    }

                    const leadsToSubmit = validLeads ?? [];
                    handleSubmission(leadsToSubmit as LeadInputType[]);
                },
            );
            submit();
        },
        [
            setFormError,
            formValidate,
            bulkCreateLeads,
            projectId,
            init,
            pop,
            reset,
            leadsFilter,
            alert,
        ],
    );

    return {
        formValue,
        formPristine,
        formError,
        bulkUpdateLeadsPending,
        handleLeadChange,
        handleLeadRemove,
        handleSubmit,
        setFormFieldValue,
    };
}
