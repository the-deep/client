import React, { useContext, useMemo, useState, useCallback } from 'react';
import {
    _cs,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    useAlert,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    useForm,
    useFormArray,
    SetValueArg,
    isCallable,
    createSubmitHandler,
    getErrorObject,
    removeNull,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';

import _ts from '#ts';
import {
    BulkCreateLeadsMutation,
    BulkCreateLeadsMutationVariables,
    LeadInputType,
} from '#generated/types';
import useBatchManager, { filterFailed, filterCompleted } from '#hooks/useBatchManager';
import { UserContext } from '#base/context/UserContext';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    schema,
    PartialLeadType,
    PartialFormType,
    defaultFormValues,
} from './schema';

import Upload from './Upload';
import FilesUploaded from './FilesUploaded';
import {
    FileUploadResponse,
    sourceTypeMap,
} from './types';
import styles from './styles.css';

export const BULK_CREATE_LEADS = gql`
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

interface Props {
    className?: string;
    onClose: () => void;
    projectId: string;
}

function BulkUpload(props: Props) {
    const {
        className,
        onClose,
        projectId,
    } = props;

    // Store uploaded files on memory to show preview
    // NOTE: If a lead is removed or saved, uploaded files are not being removed at the moment
    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

    const [selectedLead, setSelectedLead] = useState<string | undefined>();

    // NOTE: handling bulkUpdateLeadsPending because we are making another
    // request after one completes. This avoids loading flickers
    const [bulkUpdateLeadsPending, setBulkUpdateLeadsPending] = useState(false);

    type Req = NonNullable<BulkCreateLeadsMutationVariables['leads']>[number];
    type Res = NonNullable<NonNullable<NonNullable<NonNullable<BulkCreateLeadsMutation['project']>['leadBulk']>['result']>[number]>;
    type Err = NonNullable<NonNullable<NonNullable<NonNullable<BulkCreateLeadsMutation['project']>['leadBulk']>['errors']>[number]>;

    const {
        inspect,
        init,
        reset,
        pop,
        update,
    } = useBatchManager<string, Req, Res, Err>();

    const { user } = useContext(UserContext);

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

    const handleTermination = useCallback(
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
        },
        [inspect, reset, alert, setFormError, setFormFieldValue],
    );

    const [
        bulkCreateLeads,
    ] = useMutation<BulkCreateLeadsMutation, BulkCreateLeadsMutationVariables>(
        BULK_CREATE_LEADS,
        {
            // refetchQueries: ['ProjectSources'],
            onCompleted: (response) => {
                const leadBulk = response.project?.leadBulk;
                if (!leadBulk) {
                    setBulkUpdateLeadsPending(false);
                    handleTermination();
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
                    handleTermination();
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
                handleTermination();
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

    const handleFileUploadSuccess = useCallback(
        (value: FileUploadResponse) => {
            setUploadedFiles((oldUploadedFiles) => ([
                value,
                ...oldUploadedFiles,
            ]));

            const newLead: PartialLeadType = {
                clientId: randomString(),
                sourceType: sourceTypeMap[value.sourceType],
                confidentiality: 'UNPROTECTED',
                priority: 'LOW',
                isAssessmentLead: false,
                attachment: String(value.id),
                title: value.title,
                assignee: user?.id,
            };

            setFormFieldValue(
                (oldVal: PartialFormType['leads']) => [
                    ...(oldVal ?? []),
                    newLead,
                ],
                'leads',
            );
            setSelectedLead((oldSelection) => (
                oldSelection ?? newLead.clientId
            ));
        },
        [setUploadedFiles, setFormFieldValue, user],
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
            const submit = createSubmitHandler(
                formValidate,
                setFormError,
                (value) => {
                    // FIXME: do not send leads with error
                    const leadsWithoutError = value.leads ?? [];

                    init(
                        leadsWithoutError as LeadInputType[],
                        (item) => item.clientId as string,
                    );

                    const initialLeads = pop();

                    if (initialLeads.length <= 0) {
                        return;
                    }

                    bulkCreateLeads({
                        variables: {
                            projectId,
                            leads: initialLeads,
                        },
                    });
                },
            );
            submit();
        },
        [setFormError, formValidate, bulkCreateLeads, projectId, init, pop],
    );

    const leadsError = useMemo(
        () => getErrorObject(getErrorObject(formError)?.leads),
        [formError],
    );

    const selectedLeadAttachment = useMemo(
        () => {
            if (!selectedLead) {
                return undefined;
            }
            const selectedLeadData = formValue?.leads?.find(
                (lead) => lead.clientId === selectedLead,
            );
            if (!selectedLeadData) {
                return undefined;
            }
            const selectedFile = uploadedFiles?.find(
                (file) => String(file.id) === selectedLeadData.attachment,
            );
            if (!selectedFile) {
                return undefined;
            }
            return ({
                id: String(selectedFile.id),
                title: selectedFile.title,
                mimeType: selectedFile.mimeType,
                file: selectedFile.file ? { url: selectedFile.file } : undefined,
            });
        },
        [uploadedFiles, selectedLead, formValue],
    );

    return (
        <Modal
            className={_cs(className, styles.bulkUploadModal)}
            heading={_ts('bulkUpload', 'title')}
            size="cover"
            onCloseButtonClick={onClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    disabled={
                        formPristine
                        || bulkUpdateLeadsPending
                        || (formValue?.leads?.length ?? 0) < 1
                    }
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {bulkUpdateLeadsPending && <PendingMessage />}
            <Upload
                className={styles.upload}
                onSuccess={handleFileUploadSuccess}
            />
            <FilesUploaded
                leads={formValue.leads}
                className={styles.details}
                onLeadRemove={handleLeadRemove}
                selectedLead={selectedLead}
                leadsError={leadsError}
                onLeadChange={handleLeadChange}
                onSelectedLeadChange={setSelectedLead}
                selectedLeadAttachment={selectedLeadAttachment}
                projectId={projectId}
            />
        </Modal>
    );
}

export default BulkUpload;
