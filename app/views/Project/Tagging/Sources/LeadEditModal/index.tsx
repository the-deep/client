import React, { useContext, useMemo, useCallback, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    Card,
    Button,
    Modal,
    useAlert,
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
import { ProjectContext } from '#base/context/ProjectContext';
import { UserContext } from '#base/context/UserContext';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
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
            id
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

const LEAD_FRAGMENT = gql`
    fragment LeadResponse on LeadType {
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
`;

const LEAD_UPDATE = gql`
    ${LEAD_FRAGMENT}
    mutation LeadUpdate(
        $projectId: ID!,
        $data: LeadInputType!,
        $leadId: ID!,
    ) {
        project(id: $projectId) {
            id
            leadUpdate(id: $leadId, data: $data) {
                ok
                errors
                result {
                    ...LeadResponse
                }
            }
        }
    }
`;

const LEAD_CREATE = gql`
    ${LEAD_FRAGMENT}
    mutation LeadCreate(
        $projectId: ID!,
        $data: LeadInputType!,
    ) {
        project(id: $projectId) {
            id
            leadCreate(data: $data) {
                ok
                errors
                result {
                    ...LeadResponse
                }
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
    const alert = useAlert();
    const { project } = useContext(ProjectContext);
    const { user } = useContext(UserContext);

    const initialValue: PartialFormType = useMemo(() => ({
        clientId: `auto-${randomString()}`,
        sourceType: 'WEBSITE',
        priority: 'LOW',
        confidentiality: 'UNPROTECTED',
        isAssessmentLead: false,
        assignee: user?.id,
    }), [user]);

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>(user ? [user] : undefined);

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
        pristine,
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
            refetchQueries: ['ProjectSources'],
            onCompleted: (response) => {
                if (!response?.project?.leadUpdate) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = response.project.leadUpdate;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    alert.show(
                        'Successfully updated source!',
                        { variant: 'success' },
                    );
                    onLeadSaveSuccess();
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'There was an issue updating the selected source!',
                    { variant: 'error' },
                );
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
            refetchQueries: ['ProjectSources'],
            onCompleted: (response) => {
                if (!response?.project?.leadCreate) {
                    return;
                }
                const {
                    ok,
                    errors,
                } = response.project.leadCreate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    alert.show(
                        'Successfully created source!',
                        { variant: 'success' },
                    );
                    onLeadSaveSuccess();
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'There was an issue creating a new source!',
                    { variant: 'error' },
                );
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
            size="cover"
            heading={leadId ? 'Edit source' : 'Add a website'}
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
                    url={value?.url ?? undefined}
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
                    hasAssessment={project?.hasAssessmentTemplate}
                />
            </Card>
        </Modal>
    );
}

export default LeadEditModal;
