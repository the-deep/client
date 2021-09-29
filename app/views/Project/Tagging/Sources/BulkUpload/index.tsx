import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
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
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';

import _ts from '#ts';
import {
    BulkCreateLeadsMutation,
    BulkCreateLeadsMutationVariables,
    LeadInputType,
} from '#generated/types';
import { transformToFormError } from '#base/utils/errorTransform';

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
    onLeadsAdd: () => void;
    projectId: string;
}

function BulkUpload(props: Props) {
    const {
        className,
        onClose,
        projectId,
        onLeadsAdd,
    } = props;

    // NOTE: If a lead is removed or saved, uploaded files are not being removed at the moment
    const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
    // NOTE: leadsAdded is a boolean set when at least on lead was successfully added
    const [leadsAdded, setLeadsAdded] = useState<boolean>(false);
    const [selectedLead, setSelectedLead] = useState<string | undefined>();
    const [leadClientIds, setLeadClientIds] = useState<string[] | undefined>();

    const handleModalClose = useCallback(() => {
        onClose();
        if (leadsAdded) {
            onLeadsAdd();
        }
    }, [onClose, onLeadsAdd, leadsAdded]);

    const alert = useAlert();

    const {
        value: formValue,
        error: formError,
        validate: formValidate,
        setFieldValue: setFormFieldValue,
        setError: setFormError,
        pristine: formPristine,
    } = useForm(schema, defaultFormValues);

    const leadsError = useMemo(
        () => getErrorObject(getErrorObject(formError)?.leads),
        [formError],
    );

    const {
        setValue: onLeadChange,
    } = useFormArray<'leads', PartialLeadType>('leads', setFormFieldValue);

    const [
        bulkCreateLeads,
        { loading: bulkCreateLeadsPending },
    ] = useMutation<BulkCreateLeadsMutation, BulkCreateLeadsMutationVariables>(
        BULK_CREATE_LEADS,
        {
            onCompleted: (response) => {
                const leadBulk = response.project?.leadBulk;
                if (!leadBulk) {
                    return;
                }
                const {
                    errors,
                    result,
                } = leadBulk;

                if (errors) {
                    const leadsErrors = errors?.map((item, index) => {
                        if (isNotDefined(item)) {
                            return undefined;
                        }
                        const clientId = leadClientIds?.[index];
                        if (isNotDefined(clientId)) {
                            return undefined;
                        }

                        return {
                            clientId,
                            error: transformToFormError(item),
                        };
                    }).filter(isDefined) ?? [];
                    const leadsErrorMapping = listToMap(
                        leadsErrors,
                        (item) => item.clientId,
                        (item) => item.error,
                    );
                    setFormError((oldError) => {
                        const err = getErrorObject(oldError);
                        return {
                            ...err,
                            leads: {
                                ...getErrorObject(err?.leads),
                                ...leadsErrorMapping,
                            },
                        };
                    });
                }
                if (result) {
                    const uploadedLeads = result.map((item, index) => {
                        if (isNotDefined(item)) {
                            return undefined;
                        }
                        const clientId = leadClientIds?.[index];
                        if (isNotDefined(clientId)) {
                            return undefined;
                        }

                        return clientId;
                    }).filter(isDefined);

                    if (uploadedLeads.length > 0) {
                        alert.show(
                            `${uploadedLeads.length} leads were successfully added!`,
                            { variant: 'success' },
                        );
                        setLeadsAdded(true);
                        setFormFieldValue((oldValues) => (
                            oldValues?.filter((lead) => !uploadedLeads.includes(lead.clientId))
                        ), 'leads');
                    }

                    const erroredLeadsCount = result?.length - uploadedLeads.length;
                    if (erroredLeadsCount > 0) {
                        alert.show(
                            `${uploadedLeads.length} couldn't be saved!`,
                            { variant: 'error' },
                        );
                    }
                }
            },
            onError: (gqlError) => {
                alert.show(
                    'Failed to save leads!',
                    { variant: 'error' },
                );
                // eslint-disable-next-line no-console
                console.error(gqlError);
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

    const handleFileUploadSuccess = useCallback((value: FileUploadResponse) => {
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
        };
        setFormFieldValue(
            (oldVal: PartialFormType['leads']) => [
                ...(oldVal ?? []),
                newLead,
            ],
            'leads',
        );
        if (!selectedLead) {
            setSelectedLead(newLead.clientId);
        }
    }, [setUploadedFiles, setFormFieldValue, selectedLead]);

    const handleLeadRemove = useCallback((clientId: string) => {
        setFormFieldValue((oldVal) => oldVal?.filter((lead) => lead.clientId !== clientId), 'leads');
    }, [setFormFieldValue]);

    const selectedLeadAttachment = useMemo(() => {
        if (!selectedLead) {
            return undefined;
        }
        const selectedLeadData = formValue?.leads?.find((lead) => lead.clientId === selectedLead);
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
    }, [uploadedFiles, selectedLead, formValue]);

    const handleSubmit = useCallback(
        () => {
            if (!projectId) {
                return;
            }
            const submit = createSubmitHandler(
                formValidate,
                setFormError,
                (value) => {
                    setLeadClientIds(value?.leads?.map((lead) => lead.clientId));
                    const leads = (value.leads ?? []) as LeadInputType[];

                    if (leads.length > 0) {
                        bulkCreateLeads({
                            variables: {
                                projectId,
                                leads,
                            },
                        });
                    }
                },
            );
            submit();
        },
        [setFormError, formValidate, bulkCreateLeads, projectId],
    );

    return (
        <Modal
            className={_cs(className, styles.bulkUploadModal)}
            heading={_ts('bulkUpload', 'title')}
            onCloseButtonClick={handleModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name={undefined}
                    disabled={
                        formPristine
                        || bulkCreateLeadsPending
                        || (formValue?.leads?.length ?? 0) < 1
                    }
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            {bulkCreateLeadsPending && <PendingMessage />}
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
