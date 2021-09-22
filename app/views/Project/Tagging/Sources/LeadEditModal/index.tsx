import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    Modal,
} from '@the-deep/deep-ui';
import {
    removeNull,
    useForm,
    createSubmitHandler,
    internal,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery, gql } from '@apollo/client';

import LeadPreview from '#components/lead/LeadPreview';

import { schema, PartialFormType } from '#components/lead/LeadEditForm/schema';
import {
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
    ProjectLeadQuery,
    ProjectLeadQueryVariables,
    LeadInputType,
    LeadUpdateMutation,
    LeadUpdateMutationVariables,
    LeadCreateMutation,
    LeadCreateMutationVariables,
} from '#generated/types';
import { transformToFormError } from '#base/utils/errorTransform';
import LeadEditForm from '#components/lead/LeadEditForm';
import styles from './styles.css';

// TODO: Show attachment's title and link if lead is attachment type

const LEAD_OPTIONS = gql`
    query LeadOptions {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

const PROJECT_LEAD = gql`
    query ProjectLead($projectId: ID!, $leadId: ID!) {
        project(id: $projectId) {
            lead (id: $leadId) {
                id,
                title,
                leadGroup {
                    id,
                    title,
                },
                title,
                assignee {
                    id,
                    displayName,
                }
                publishedOn,
                text,
                url,
                website,
                attachment {
                    id
                    title
                    mimeType
                    file {
                        url
                    }
                }
                isAssessmentLead
                sourceType
                priority
                confidentiality
                status
                source {
                    id
                    title
                    mergedAs {
                        id
                        title
                    }
                }
                authors {
                    id
                    title
                    mergedAs {
                        id
                        title
                    }
                }
                emmEntities {
                    id
                    name
                }
                emmTriggers {
                    id
                    emmKeyword
                    emmRiskFactor
                    count
                }
            }
        }
    }
`;

const LEAD_UPDATE = gql`
    mutation LeadUpdate(
        $projectId: ID!,
        $data: LeadInputType!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            leadUpdate(id: $leadId, data: $data) {
                ok,
                errors,
            }
        }
    }
`;

const LEAD_CREATE = gql`
    mutation LeadCreate(
        $projectId: ID!,
        $data: LeadInputType!,
    ) {
        project(id: $projectId) {
            leadCreate(data: $data) {
                ok,
                errors,
            }
        }
    }
`;

interface Props {
    className?: string;
    onClose: () => void;
    leadId?: string;
    projectId: string;
    onLeadSaveSuccess: () => void;
}

function LeadEditModal(props: Props) {
    const {
        className,
        onClose,
        projectId,
        leadId,
        onLeadSaveSuccess,
    } = props;

    const [initialValue] = useState<PartialFormType>(() => ({
        sourceType: 'WEBSITE',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
    }));

    const {
        pristine,
        setPristine,
        value,
        setFieldValue,
        setValue,
        error: riskyError,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const variables = useMemo(
        () => (leadId ? ({
            leadId,
            projectId,
        }) : undefined),
        [leadId, projectId],
    );

    const {
        loading: leadOptionsLoading,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

    const {
        loading: leadLoading,
        data: lead,
    } = useQuery<ProjectLeadQuery, ProjectLeadQueryVariables>(
        PROJECT_LEAD,
        {
            skip: !variables,
            variables,
            onCompleted: (response) => {
                const leadData = removeNull(response?.project?.lead);
                if (leadData) {
                    setValue({
                        ...leadData,
                        attachment: leadData?.attachment?.id,
                        leadGroup: leadData?.leadGroup?.id,
                        assignee: leadData?.assignee?.id,
                        source: leadData?.source?.id,
                        authors: leadData?.authors?.map((author) => author.id),
                    });
                }
            },
        },
    );

    const [
        updateLead,
        {
            loading: leadUpdatePending,
        },
    ] = useMutation<LeadUpdateMutation, LeadUpdateMutationVariables>(
        LEAD_UPDATE,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadUpdate) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = response.project.leadUpdate;
                // FIXME: To talk with @tnagorra to figure our non field error during form save
                if (errors) {
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok) {
                    onLeadSaveSuccess();
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const [
        createLead,
        {
            loading: leadCreatePending,
        },
    ] = useMutation<LeadCreateMutation, LeadCreateMutationVariables>(
        LEAD_CREATE,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadCreate) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = response.project.leadCreate;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok) {
                    onLeadSaveSuccess();
                }
            },
        },
    );

    const leadData = lead?.project?.lead;

    const pending = leadLoading || leadOptionsLoading || leadCreatePending || leadUpdatePending;

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const data = { ...val } as LeadInputType;
                if (leadId) {
                    updateLead({
                        variables: {
                            data,
                            projectId,
                            leadId,
                        },
                    });
                } else {
                    createLead({
                        variables: {
                            data,
                            projectId,
                        },
                    });
                }
            },
        );
        submit();
    }, [setError, validate, updateLead, createLead, projectId, leadId]);

    return (
        <Modal
            className={_cs(className, styles.leadEditModal)}
            onCloseButtonClick={onClose}
            heading={leadId ? 'Edit source' : 'Add a source'}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="save"
                    disabled={pristine || pending}
                    onClick={handleSubmit}
                >
                    Save
                </Button>
            )}
        >
            <Card className={styles.previewContainer}>
                <LeadPreview
                    className={styles.preview}
                    url={leadData?.url}
                    attachment={leadData?.attachment ?? undefined}
                />
            </Card>
            <Card className={styles.formContainer}>
                <LeadEditForm
                    pending={pending}
                    value={value}
                    projectId={projectId}
                    setFieldValue={setFieldValue}
                    setValue={setValue}
                    setPristine={setPristine}
                    error={riskyError}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                    sourceOrganization={leadData?.source}
                    authorOrganizations={leadData?.authors}
                    leadGroup={leadData?.leadGroup}
                    assignee={leadData?.assignee}
                    attachment={leadData?.attachment}
                />
            </Card>
        </Modal>
    );
}

export default LeadEditModal;
