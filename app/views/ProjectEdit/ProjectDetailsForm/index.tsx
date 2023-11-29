import React, { useMemo, useContext, useState, useCallback } from 'react';
import {
    Prompt,
    useHistory,
    generatePath,
    useLocation,
} from 'react-router-dom';
import {
    IoInformationCircleOutline,
    IoTrashBinOutline,
} from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import {
    Button,
    Container,
    Checkbox,
    PendingMessage,
    TextInput,
    DateInput,
    TextArea,
    ListView,
    ContainerCard,
    Modal,
    useAlert,
    Switch,
} from '@the-deep/deep-ui';
import {
    isDefined,
    listToGroupList,
    compareDate,
} from '@togglecorp/fujs';
import {
    ObjectSchema,
    defaultUndefinedType,
    requiredStringCondition,
    removeNull,
    useForm,
    PartialForm,
    ArraySchema,
    requiredCondition,
    getErrorObject,
    createSubmitHandler,
    PurgeNull,
} from '@togglecorp/toggle-form';
import {
    useLazyQuery,
    useQuery,
    gql,
    useMutation,
} from '@apollo/client';

import { SubNavbarActions } from '#components/SubNavbar';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import NonFieldError from '#components/NonFieldError';
import UserContext from '#base/context/UserContext';
import ProjectContext from '#base/context/ProjectContext';
import AddStakeholderButton from '#components/general/AddStakeholderButton';
import { termsNotice } from '#utils/terms';
import BooleanInput, { Option as BooleanOption } from '#components/selections/BooleanInput';
import {
    BasicOrganization,
} from '#types';
import routes from '#base/configs/routes';
import { useModalState } from '#hooks/stateManagement';
import generateString from '#utils/string';

import _ts from '#ts';
import {
    UserLastActiveProjectQuery,
    UserLastActiveProjectQueryVariables,
    ProjectCreateInputType,
    ProjectUpdateInputType,
    DeleteProjectMutation,
    DeleteProjectMutationVariables,
    UserCurrentProjectQuery,
    UserCurrentProjectQueryVariables,
    ProjectCreateMutation,
    ProjectCreateMutationVariables,
    ProjectUpdateMutation,
    ProjectUpdateMutationVariables,
    ProjectOrganizationTypeEnum,
} from '#generated/types';
import { LAST_ACTIVE_PROJECT_FRAGMENT } from '#gqlFragments';
import { DeepMandatory } from '#utils/types';

import StakeholderList from './StakeholderList';
import RequestPrivateProjectButton from './RequestPrivateProjectButton';

import styles from './styles.css';

const privacyTooltip = 'Public projects will be visible in the "Explore DEEP" section. Any registered users will be able to see the project name, the target country, a scheenshot of the framework and the number of users, entries and sources it contains. This is the default option in DEEP as to foster collaboration and avoid duplication or efforts.  Private projects will not be visible in the "Explore DEEP" section. This feature can be exceptionally requested for projects dealing with sensitive information or topics. Requests are assessed case by case and the feature is activated only in the case specific harm to the users, data or the platform itself is possible.';
const assessmentTooltip = 'Enable assessment tagging.';

const DELETE_PROJECT = gql`
    mutation deleteProject($projectId: ID!) {
        project(id: $projectId) {
            projectDelete {
                errors
                ok
            }
        }
    }
`;

interface StakeholderType {
    id: ProjectOrganizationTypeEnum;
    label: string;
}

const stakeholderTypes: StakeholderType[] = [
    {
        label: _ts('project.detail.stakeholders', 'leadOrganization'),
        id: 'LEAD_ORGANIZATION',
    },
    {
        label: _ts('project.detail.stakeholders', 'internationalPartner'),
        id: 'INTERNATIONAL_PARTNER',
    },
    {
        label: _ts('project.detail.stakeholders', 'nationalPartner'),
        id: 'NATIONAL_PARTNER',
    },
    {
        label: _ts('project.detail.stakeholders', 'donor'),
        id: 'DONOR',
    },
    {
        label: _ts('project.detail.stakeholders', 'government'),
        id: 'GOVERNMENT',
    },
];

const projectVisibilityOptions: BooleanOption[] = [
    {
        key: 'false',
        value: _ts('projectEdit', 'publicProject'),
    },
    {
        key: 'true',
        value: _ts('projectEdit', 'privateProject'),
    },
];

type ProjectCreateType = DeepMandatory<PurgeNull<ProjectCreateInputType>, 'clientId'>
type PartialFormType = PartialForm<ProjectCreateType, 'clientId'>
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type PartialOrganizationType = NonNullable<PartialFormType['organizations']>[number];
type OrganizationsSchema = ObjectSchema<PartialOrganizationType, PartialFormType>;
type OrganizationsSchemaFields = ReturnType<OrganizationsSchema['fields']>;
type OrganizationsListSchema = ArraySchema<PartialOrganizationType, PartialFormType>;
type OrganizationsListMember = ReturnType<OrganizationsListSchema['member']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        startDate: [],
        endDate: [],
        description: [],
        organizations: {
            keySelector: (org) => org.clientId,
            member: (): OrganizationsListMember => ({
                fields: (): OrganizationsSchemaFields => ({
                    id: [defaultUndefinedType],
                    clientId: [requiredCondition],
                    organization: [],
                    organizationType: [],
                }),
            }),
        },
        hasPubliclyViewableUnprotectedLeads: [requiredCondition],
        hasPubliclyViewableRestrictedLeads: [requiredCondition],
        hasPubliclyViewableConfidentialLeads: [requiredCondition],
        isPrivate: [],
        isAssessmentEnabled: [],
        isTest: [],
    }),
    validation: (value) => {
        if (
            value?.startDate
            && value?.endDate
            && (compareDate(value.startDate, value.endDate) > 0)
        ) {
            return (_ts('projectEdit', 'endDateGreaterThanStartDate'));
        }
        return undefined;
    },
};

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

const initialValue: PartialFormType = {
    title: '',
    isPrivate: false,
    isTest: false,
    isAssessmentEnabled: false,
    hasPubliclyViewableUnprotectedLeads: false,
    hasPubliclyViewableConfidentialLeads: false,
    hasPubliclyViewableRestrictedLeads: false,
};

const LAST_ACTIVE_PROJECT = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    query UserLastActiveProject {
        me {
            id
            displayName
            displayPictureUrl
            accessibleFeatures {
                key
            }
            lastActiveProject {
                ...LastActiveProjectResponse
            }
        }
    }
`;

const CURRENT_PROJECT = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    query UserCurrentProject($projectId: ID!) {
        project(id: $projectId) {
            id
            ...LastActiveProjectResponse
            title
            startDate
            endDate
            createdBy {
                displayName
            }
            createdAt
            description
            isPrivate
            isTest
            isAssessmentEnabled
            hasPubliclyViewableUnprotectedLeads
            hasPubliclyViewableConfidentialLeads
            hasPubliclyViewableRestrictedLeads
            organizations {
                id
                clientId
                organization {
                    id
                    title
                    verified
                    mergedAs {
                        id
                        title
                    }
                }
                organizationType
                organizationTypeDisplay
            }
        }
    }
`;

const PROJECT_CREATE = gql`
${LAST_ACTIVE_PROJECT_FRAGMENT}
mutation ProjectCreate($data: ProjectCreateInputType!) {
    projectCreate(data: $data) {
        ok
        result {
            ...LastActiveProjectResponse
            id
            title
            startDate
            endDate
            isAssessmentEnabled
            hasPubliclyViewableUnprotectedLeads
            hasPubliclyViewableConfidentialLeads
            hasPubliclyViewableRestrictedLeads
            createdBy {
                displayName
            }
            createdAt
            description
            isPrivate
            organizations {
                id
                clientId
                organization {
                    id
                    title
                    mergedAs {
                        id
                        title
                    }
                }
                organizationType
                organizationTypeDisplay
            }
        }
        errors
    }
}
`;

const PROJECT_UPDATE = gql`
${LAST_ACTIVE_PROJECT_FRAGMENT}
mutation ProjectUpdate($projectId: ID!, $data: ProjectUpdateInputType!) {
    project(id: $projectId) {
        projectUpdate(data: $data) {
            ok
            result {
                id
                ...LastActiveProjectResponse
                title
                startDate
                endDate
                createdBy {
                    displayName
                }
                createdAt
                description
                isPrivate
                isTest
                isAssessmentEnabled
                hasPubliclyViewableUnprotectedLeads
                hasPubliclyViewableConfidentialLeads
                hasPubliclyViewableRestrictedLeads
                organizations {
                    id
                    clientId
                    organization {
                        id
                        title
                        mergedAs {
                            id
                            title
                        }
                    }
                    organizationType
                    organizationTypeDisplay
                }
            }
            errors
        }
    }
}
`;

interface Props {
    projectId: string | undefined;
    onCreate: (newProjectId: string) => void;
}

function ProjectDetailsForm(props: Props) {
    const {
        projectId,
        onCreate,
    } = props;

    const history = useHistory();
    const [termsAccepted, setTermsAccepted] = useState(false);

    const {
        pristine,
        setPristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const alert = useAlert();

    const {
        user,
    } = useContext(UserContext);
    const { setProject } = React.useContext(ProjectContext);

    const accessPrivateProject = !!user?.accessibleFeatures?.some((f) => f.key === 'PRIVATE_PROJECT');

    const [
        isDeleteModalVisible,
        showDeleteProjectConfirmation,
        hideDeleteProjectConfirmation,
    ] = useModalState(false);

    const error = getErrorObject(riskyError);

    const [projectTitleToDelete, setProjectTitleToDelete] = useState<string | undefined>();
    const [stakeholderOptions, setStakeholderOptions] = useState<BasicOrganization[]>([]);

    const location = useLocation();
    const {
        data: projectDetailsResponse,
        loading: projectDetailsLoading,
    } = useQuery<UserCurrentProjectQuery, UserCurrentProjectQueryVariables>(
        CURRENT_PROJECT,
        {
            skip: !projectId,
            variables: projectId ? { projectId } : undefined,
            onCompleted: (response) => {
                if (response?.project) {
                    const cleanProject = removeNull(response.project);
                    setValue({
                        ...cleanProject,
                        organizations: cleanProject?.organizations?.map((org) => ({
                            clientId: org.clientId,
                            id: org.id,
                            organization: org.organization.id,
                            organizationType: org.organizationType,
                        })),
                    });
                    setStakeholderOptions(
                        cleanProject?.organizations?.map((org) => org.organization) ?? [],
                    );
                }
            },
        },
    );

    const [
        createProject,
        {
            loading: createProjectPending,
        },
    ] = useMutation<ProjectCreateMutation, ProjectCreateMutationVariables>(
        PROJECT_CREATE,
        {
            onCompleted: (response) => {
                if (!response || !response.projectCreate) {
                    return;
                }

                const {
                    ok,
                    result,
                    errors,
                } = response.projectCreate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to create project.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    if (result?.id) {
                        setPristine(true);
                        onCreate(result.id);
                    }
                    alert.show(
                        'Successfully created project!',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create project.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        updateProject,
        {
            loading: updateProjectPending,
        },
    ] = useMutation<ProjectUpdateMutation, ProjectUpdateMutationVariables>(
        PROJECT_UPDATE,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUpdate) {
                    return;
                }

                const {
                    ok,
                    errors,
                } = response.project.projectUpdate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to update project.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    setPristine(true);
                    if (response?.project?.projectUpdate?.result) {
                        setProject(response?.project?.projectUpdate?.result);
                    }
                    alert.show(
                        'Successfully updated project!',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to update project.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        getUserLastActiveProject,
        {
            loading: userLastActiveProjectPending,
        },
    ] = useLazyQuery<UserLastActiveProjectQuery, UserLastActiveProjectQueryVariables>(
        LAST_ACTIVE_PROJECT,
        {
            onCompleted: (response) => {
                setProject(response.me?.lastActiveProject ?? undefined);
                const homePath = generatePath(routes.home.path, {});
                // NOTE: Pristine is set as if the project is deleted, we don't want confirm prompt
                setPristine(true);
                history.replace(homePath);
            },
        },
    );

    const [
        triggerProjectDelete,
        {
            loading: projectDeletePending,
        },
    ] = useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(
        DELETE_PROJECT,
        {
            onCompleted: (response) => {
                if (!response.project?.projectDelete) {
                    return;
                }

                if (response.project.projectDelete.ok) {
                    getUserLastActiveProject();
                    alert.show(
                        'Successfully deleted project.',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'There was an error deleting this project!',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleProjectDeleteConfirmCancel = useCallback(() => {
        hideDeleteProjectConfirmation();
        setProjectTitleToDelete(undefined);
    }, [hideDeleteProjectConfirmation]);

    const handleProjectDeleteConfirm = useCallback(() => {
        if (projectId) {
            triggerProjectDelete({ variables: { projectId } });
        }
    }, [
        triggerProjectDelete,
        projectId,
    ]);

    const groupedStakeholders = useMemo(
        () => listToGroupList(
            (value?.organizations ?? []).filter((org) => org.organizationType),
            (o) => o.organizationType ?? '',
            (o) => o.organization,
        ),
        [value],
    );

    const organizationListRendererParams = useCallback(
        (key: ProjectOrganizationTypeEnum, v: StakeholderType) => {
            const organizations = groupedStakeholders[key];
            return {
                data: organizations
                    ?.map((o) => stakeholderOptions.find((option) => option.id === o))
                    .filter(isDefined),
                title: v.label,
                dataPending: projectDetailsLoading,
            };
        },
        [groupedStakeholders, stakeholderOptions, projectDetailsLoading],
    );

    const [
        isTermsModalShown,
        showTermsModal,
        hideTermsModal,
    ] = useModalState(false);

    const [
        isConfidentialDocumentSharingModalShown,
        showConfidentialDocumentSharingModal,
        hideConfidentialDocumentSharingModal,
    ] = useModalState(false);

    const pending = projectDetailsLoading
        || createProjectPending
        || updateProjectPending;

    const disabled = pending;

    const handleProjectUpdate = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    if (projectId) {
                        updateProject({
                            variables: {
                                projectId,
                                data: val as ProjectUpdateInputType,
                            },
                        });
                    } else {
                        createProject({
                            variables: {
                                data: val as ProjectCreateInputType,
                            },
                        });
                    }
                },
            );
            submit();
        },
        [
            setError,
            createProject,
            validate,
            projectId,
            updateProject,
        ],
    );

    const handleTitleChange = useCallback((val: string | undefined) => {
        if (val && (val.search(/\btest\b/i)) !== -1) {
            setFieldValue(true, 'isTest');
        }
        setFieldValue(val, 'title');
    }, [setFieldValue]);

    const projectDetails = projectDetailsResponse?.project;

    const handleTermsAccept = useCallback(() => {
        setTermsAccepted(true);
        hideTermsModal();
    }, [hideTermsModal]);

    const handleTermsCancel = useCallback(() => {
        setTermsAccepted(false);
        hideTermsModal();
    }, [hideTermsModal]);

    const handleConfidentialDocumentSharingAccept = useCallback(() => {
        setFieldValue(true, 'hasPubliclyViewableConfidentialLeads');
        hideConfidentialDocumentSharingModal();
    }, [hideConfidentialDocumentSharingModal, setFieldValue]);

    const handleConfidentialDocumentSharingCancel = useCallback(() => {
        hideConfidentialDocumentSharingModal();
    }, [hideConfidentialDocumentSharingModal]);

    const handleConfidentialDocumentSharing = useCallback((val: boolean) => {
        if (val) {
            showConfidentialDocumentSharingModal();
        } else {
            setFieldValue(false, 'hasPubliclyViewableConfidentialLeads');
        }
    }, [showConfidentialDocumentSharingModal, setFieldValue]);

    const shouldTermsBeAccepted = !projectId && !termsAccepted;

    return (
        <div className={styles.projectDetails}>
            <SubNavbarActions>
                <Button
                    disabled={disabled || pristine || shouldTermsBeAccepted}
                    title={
                        (shouldTermsBeAccepted && !disabled && !pristine)
                            ? 'You have to accept terms of use to create the project.'
                            : undefined
                    }
                    onClick={handleProjectUpdate}
                    variant="primary"
                    name={undefined}
                >
                    Save Project
                </Button>
            </SubNavbarActions>
            {pending && <PendingMessage />}
            <NonFieldError error={error} />
            <div className={styles.content}>
                <div className={styles.left}>
                    <TextInput
                        className={styles.input}
                        name="title"
                        disabled={disabled}
                        onChange={handleTitleChange}
                        value={value?.title}
                        error={error?.title}
                        label={_ts('projectEdit', 'projectTitle')}
                        placeholder={_ts('projectEdit', 'projectTitle')}
                        autoFocus
                    />
                    <Switch
                        name="isTest"
                        label="Is Test Project"
                        value={value?.isTest}
                        onChange={setFieldValue}
                    />
                    <div className={styles.dates}>
                        <DateInput
                            className={styles.dateInput}
                            name="startDate"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value?.startDate}
                            error={error?.startDate}
                            label={_ts('projectEdit', 'projectStartDate')}
                            placeholder={_ts('projectEdit', 'projectStartDate')}
                        />
                        <DateInput
                            className={styles.dateInput}
                            name="endDate"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value?.endDate}
                            error={error?.endDate}
                            label={_ts('projectEdit', 'projectEndDate')}
                            placeholder={_ts('projectEdit', 'projectEndDate')}
                        />
                    </div>
                    <TextArea
                        className={styles.input}
                        name="description"
                        disabled={disabled}
                        onChange={setFieldValue}
                        value={value?.description}
                        error={error?.description}
                        label={_ts('projectEdit', 'projectDescription')}
                        placeholder={_ts('projectEdit', 'projectDescription')}
                        rows={4}
                    />
                    <ContainerCard
                        className={styles.stakeholders}
                        heading={_ts('projectEdit', 'projectStakeholders')}
                        headingSize="extraSmall"
                        headerActions={(
                            <AddStakeholderButton
                                name="organizations"
                                value={value?.organizations}
                                onChange={setFieldValue}
                                onOptionsChange={setStakeholderOptions}
                                options={stakeholderOptions}
                            />
                        )}
                    >
                        <ListView
                            className={styles.organizationsContainer}
                            errored={false}
                            data={stakeholderTypes}
                            rendererParams={organizationListRendererParams}
                            renderer={StakeholderList}
                            rendererClassName={styles.organizations}
                            keySelector={stakeholderTypeKeySelector}
                            pending={false}
                            filtered={false}
                        />
                    </ContainerCard>
                </div>
                <div className={styles.right}>
                    <Container
                        className={styles.visibility}
                        headingSize="extraSmall"
                        contentClassName={styles.items}
                        heading="Assessment Registry"
                        inlineHeadingDescription
                        headerDescriptionClassName={styles.infoIconContainer}
                        headingDescription={(
                            <IoInformationCircleOutline
                                className={styles.infoIcon}
                                title={assessmentTooltip}
                            />
                        )}
                    >
                        <Switch
                            name="isAssessmentEnabled"
                            label="Is Assessment Enabled"
                            value={value?.isAssessmentEnabled}
                            onChange={setFieldValue}
                        />
                    </Container>
                    <Container
                        className={styles.visibility}
                        headingSize="extraSmall"
                        contentClassName={styles.items}
                        heading={_ts('projectEdit', 'projectVisibility')}
                        inlineHeadingDescription
                        headerDescriptionClassName={styles.infoIconContainer}
                        headingDescription={(
                            <IoInformationCircleOutline
                                className={styles.infoIcon}
                                title={privacyTooltip}
                            />
                        )}
                    >
                        <BooleanInput
                            className={styles.segmentInput}
                            name="isPrivate"
                            value={value?.isPrivate}
                            onChange={setFieldValue}
                            options={projectVisibilityOptions}
                            type="segment"
                            disabled={isDefined(projectId) || !accessPrivateProject}
                        />
                        {!accessPrivateProject && !isDefined(projectId) && (
                            <RequestPrivateProjectButton />
                        )}
                    </Container>
                    <Container
                        className={styles.documentSharing}
                        headingSize="extraSmall"
                        contentClassName={styles.items}
                        heading="Document Sharing"
                        inlineHeadingDescription
                        headerDescriptionClassName={styles.infoIconContainer}
                        headingDescription={(
                            <IoInformationCircleOutline
                                className={styles.infoIcon}
                                title="You can allow documents uploaded to your project to be publicly viewed for users that have a document's link. People won't be able to know what these links are unless you share them."
                            />
                        )}
                    >
                        <Switch
                            name="hasPubliclyViewableUnprotectedLeads"
                            value={value?.hasPubliclyViewableUnprotectedLeads}
                            onChange={setFieldValue}
                            label={(
                                <>
                                    Allow links for
                                    <i className={styles.italic}>Public</i>
                                    documents to be viewed publicly
                                </>
                            )}
                        />
                        <Switch
                            name="hasPubliclyViewableRestrictedLeads"
                            value={value?.hasPubliclyViewableRestrictedLeads}
                            onChange={setFieldValue}
                            label={(
                                <>
                                    Allow links for
                                    <i className={styles.italic}>Restricted</i>
                                    documents to be viewed publicly
                                </>
                            )}
                        />
                        <Switch
                            name="hasPubliclyViewableConfidentialLeads"
                            value={value?.hasPubliclyViewableConfidentialLeads}
                            onChange={handleConfidentialDocumentSharing}
                            label={(
                                <>
                                    Allow links for
                                    <i className={styles.italic}>Confidential</i>
                                    documents to be viewed publicly
                                </>
                            )}
                        />
                    </Container>
                    <div className={styles.createdByDetails}>
                        {projectDetails?.createdBy?.displayName && (
                            <TextInput
                                name="createdByName"
                                className={styles.input}
                                label={_ts('projectEdit', 'projectCreatedBy')}
                                value={projectDetails.createdBy.displayName}
                                disabled
                            />
                        )}
                        {projectDetails?.createdAt && (
                            <DateInput
                                name="createdAt"
                                className={styles.input}
                                value={projectDetails.createdAt.split('T')[0]}
                                label={_ts('projectEdit', 'projectCreatedOn')}
                                disabled
                            />
                        )}
                    </div>
                    {!projectId && (
                        <Checkbox
                            name={undefined}
                            label={generateString(
                                'I accept the {termsButton}',
                                {
                                    termsButton: (
                                        <Button
                                            name={undefined}
                                            variant="action"
                                            onClick={showTermsModal}
                                            className={styles.termsButton}
                                        >
                                            terms of use.
                                        </Button>
                                    ),
                                },
                            )}
                            value={termsAccepted}
                            onChange={setTermsAccepted}
                        />
                    )}
                    {projectId && (
                        <Button
                            name="deleteProject"
                            disabled={(
                                projectDeletePending
                                || userLastActiveProjectPending
                            )}
                            onClick={showDeleteProjectConfirmation}
                            icons={(
                                <IoTrashBinOutline />
                            )}
                        >
                            {_ts('projectEdit', 'deleteProjectButtonLabel')}
                        </Button>
                    )}
                    {isDeleteModalVisible && (
                        <Modal
                            onCloseButtonClick={handleProjectDeleteConfirmCancel}
                            heading={_ts('projectEdit', 'deleteProject')}
                            size="small"
                            freeHeight
                            footerActions={(
                                <>
                                    <Button
                                        name="cancel"
                                        onClick={handleProjectDeleteConfirmCancel}
                                        disabled={projectDeletePending}
                                        variant="secondary"
                                    >
                                        {_ts('projectEdit', 'cancelButtonLabel')}
                                    </Button>
                                    <Button
                                        name="delete"
                                        onClick={handleProjectDeleteConfirm}
                                        disabled={projectDetails?.title !== projectTitleToDelete
                                            || projectDeletePending}
                                    >
                                        {_ts('projectEdit', 'deleteProjectButtonLabel')}
                                    </Button>
                                </>
                            )}
                        >
                            {
                                (projectDeletePending || userLastActiveProjectPending)
                                && <PendingMessage />
                            }
                            <p>
                                {_ts(
                                    'projectEdit',
                                    'deleteProjectConfirmationMessage',
                                    { title: <strong>{projectDetails?.title}</strong> },
                                )}
                            </p>
                            <p>{_ts('projectEdit', 'deleteConfirmLabel')}</p>
                            <TextInput
                                className={styles.input}
                                name="projectTitle"
                                disabled={disabled}
                                onChange={setProjectTitleToDelete}
                                value={projectTitleToDelete}
                                error={error?.title}
                                label={_ts('projectEdit', 'projectTitle')}
                                placeholder={_ts('projectEdit', 'projectTitle')}
                                autoFocus
                            />
                        </Modal>
                    )}
                </div>
            </div>
            <Prompt
                message={(newLocation) => {
                    if (newLocation.pathname !== location.pathname && !pristine) {
                        return _ts('common', 'youHaveUnsavedChanges');
                    }
                    return true;
                }}
            />
            {isTermsModalShown && (
                <Modal
                    onCloseButtonClick={hideTermsModal}
                    size="large"
                    heading="DEEP Terms of Use and Privacy Notice"
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={handleTermsCancel}
                                variant="secondary"
                            >
                                Reject
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleTermsAccept}
                                variant="primary"
                            >
                                Accept
                            </Button>
                        </>
                    )}
                >
                    <ReactMarkdown className={styles.termsContent}>
                        {termsNotice}
                    </ReactMarkdown>
                </Modal>
            )}
            {isConfidentialDocumentSharingModalShown && (
                <Modal
                    heading="Document Sharing"
                    size="extraSmall"
                    onCloseButtonClick={hideConfidentialDocumentSharingModal}
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={handleConfidentialDocumentSharingCancel}
                                variant="secondary"
                            >
                                No
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleConfidentialDocumentSharingAccept}
                                variant="primary"
                            >
                                Yes
                            </Button>
                        </>
                    )}
                    freeHeight
                >
                    Are you sure you want to allow links for
                    confidential documents to be viewed publicly?
                </Modal>
            )}
        </div>
    );
}

export default ProjectDetailsForm;
