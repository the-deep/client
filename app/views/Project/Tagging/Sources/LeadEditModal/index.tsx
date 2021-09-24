import React, { useMemo, useCallback, useState } from 'react';
import {
    _cs,
    randomString,
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
    SetValueArg,
} from '@togglecorp/toggle-form';
import { useMutation, useQuery, gql } from '@apollo/client';

import LeadPreview from '#components/lead/LeadPreview';

import { schema, PartialFormType } from '#components/lead/LeadInput/schema';
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
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import { transformToFormError } from '#base/utils/errorTransform';
import LeadInput from '#components/lead/LeadInput';
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
                id
                title
                clientId
                leadGroup {
                    id
                    title
                }
                title
                assignee {
                    id
                    displayName
                }
                publishedOn
                text
                url
                website
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
                ok
                errors
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
                ok
                errors
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
        clientId: randomString(),
        sourceType: 'WEBSITE',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
    }));

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>();

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>(undefined);

    const {
        // pristine,
        value,
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
                    const {
                        leadGroup,
                        assignee,
                        authors,
                        source,
                    } = leadData;

                    if (leadGroup) {
                        setLeadGroupOptions((oldVal) => (
                            oldVal ? [...oldVal, leadGroup] : [leadGroup]
                        ));
                    }
                    if (assignee) {
                        setProjectUserOptions((oldVal) => (
                            oldVal ? [...oldVal, assignee] : [assignee]
                        ));
                    }
                    if (source) {
                        setSourceOrganizationOptions((oldVal) => (
                            oldVal ? [...oldVal, source] : [source]
                        ));
                    }
                    if (authors) {
                        setAuthorOrganizationOptions((oldVal) => (
                            oldVal ? [...oldVal, ...authors] : [...authors]
                        ));
                    }
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

    const handleLeadChange = useCallback((newValue: SetValueArg<PartialFormType>) => {
        setValue(newValue, true);
    }, [setValue]);

    return (
        <Modal
            className={_cs(className, styles.leadEditModal)}
            onCloseButtonClick={onClose}
            heading={leadId ? 'Edit source' : 'Add a source'}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="save"
                    // FIXME: Add disabled during pristine later
                    // disabled={pristine || pending}
                    disabled={pending}
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
                <LeadInput
                    name={undefined}
                    pending={pending}
                    value={value}
                    onChange={handleLeadChange}
                    projectId={projectId}
                    error={riskyError}
                    defaultValue={initialValue}
                    attachment={leadData?.attachment}
                    priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                    sourceOrganizationOptions={sourceOrganizationOptions}
                    onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                    authorOrganizationOptions={authorOrganizationOptions}
                    onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                    leadGroupOptions={leadGroupOptions}
                    onLeadGroupOptionsChange={setLeadGroupOptions}
                    assigneeOptions={projectUserOptions}
                    onAssigneeOptionChange={setProjectUserOptions}
                />
            </Card>
        </Modal>
    );
}

export default LeadEditModal;
