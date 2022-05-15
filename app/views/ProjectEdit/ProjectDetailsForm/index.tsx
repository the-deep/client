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
import {
    Button,
    Container,
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
import BooleanInput, { Option as BooleanOption } from '#components/selections/BooleanInput';
import {
    ProjectDetails,
    BasicOrganization,
} from '#types';
import routes from '#base/configs/routes';
import { useModalState } from '#hooks/stateManagement';

import _ts from '#ts';
import {
    useLazyRequest,
} from '#base/utils/restRequest';
import {
    ProjectOrganizationGqInputType,
    UserLastActiveProjectQuery,
    UserLastActiveProjectQueryVariables,
    ProjectCreateInputType,
    ProjectUpdateInputType,
    UserCurrentProjectQuery,
    UserCurrentProjectQueryVariables,
    ProjectCreateMutation,
    ProjectCreateMutationVariables,
    ProjectUpdateMutation,
    ProjectUpdateMutationVariables,
    ProjectOrganizationTypeEnum,
} from '#generated/types';

import StakeholderList from './StakeholderList';
import RequestPrivateProjectButton from './RequestPrivateProjectButton';

import styles from './styles.css';

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

type PartialFormType = PartialForm<PurgeNull<ProjectCreateInputType>, 'organizations'>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type PartialOrganizationType = ProjectOrganizationGqInputType;

type StakeholderSchema = ObjectSchema<PartialOrganizationType, PartialFormType>;
type StakeholderSchemaFields = ReturnType<StakeholderSchema['fields']>;
const organizationSchema: StakeholderSchema = {
    fields: (): StakeholderSchemaFields => ({
        organization: [requiredCondition],
        organizationType: [requiredCondition],
    }),
};

type StakeholderListSchema = ArraySchema<PartialOrganizationType, PartialFormType>;
type StakeholderListMember = ReturnType<StakeholderListSchema['member']>;

const organizationListSchema: StakeholderListSchema = {
    keySelector: (d) => d.organization,
    member: (): StakeholderListMember => organizationSchema,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        startDate: [],
        endDate: [],
        description: [],
        organizations: organizationListSchema,
        hasPubliclyViewableLeads: [requiredCondition],
        isPrivate: [],
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

/*
const getOrganizationValues = (project: ProjectDetails) => (
    project.organizations.map((v) => ({
        organization: v.organization,
        organizationType: v.organizationType,
    }))
);

const getOrganizationOptions = (project: ProjectDetails) => (
    project.organizations.map((v) => ({
        id: v.organization,
        title: organizationTitleSelector(v.organizationDetails),
    }))
);
 */

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

const initialValue: PartialFormType = {
    title: '',
    isPrivate: false,
    hasPubliclyViewableLeads: false,
};

const LAST_ACTIVE_PROJECT = gql`
    query UserLastActiveProject {
        me {
            id
            displayName
            displayPictureUrl
            accessibleFeatures {
                key
            }
            lastActiveProject {
                allowedPermissions
                hasAssessmentTemplate
                analysisFramework {
                    id
                }
                currentUserRole
                id
                isPrivate
                title
                isVisualizationEnabled
                isVisualizationAvailable
            }
        }
    }
`;

const CURRENT_PROJECT = gql`
    query UserCurrentProject($projectId: ID!) {
        project(id: $projectId) {
            id
            title
            startDate
            endDate
            createdBy {
                displayName
            }
            createdAt
            description
            isPrivate
            hasPubliclyViewableLeads
            organizations {
                id
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
    }
`;

const PROJECT_CREATE = gql`
mutation ProjectCreate($data: ProjectCreateInputType!) {
    projectCreate(data: $data) {
        ok
        result {
            id
            title
            startDate
            endDate
            hasPubliclyViewableLeads
            createdBy {
                displayName
            }
            createdAt
            description
            isPrivate
            organizations {
                id
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
mutation ProjectUpdate($projectId: ID!, $data: ProjectUpdateInputType!) {
    project(id: $projectId) {
        projectUpdate(data: $data) {
            ok
            result {
                id
                title
                startDate
                endDate
                createdBy {
                    displayName
                }
                createdAt
                description
                isPrivate
                hasPubliclyViewableLeads
                organizations {
                    id
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

    const {
        pending: projectDeletePending,
        trigger: triggerProjectDelete,
    } = useLazyRequest<ProjectDetails>({
        url: projectId ? `server://projects/${projectId}/` : undefined,
        method: 'DELETE',
        onSuccess: () => {
            alert.show(
                'Successfully deleted project.',
                { variant: 'success' },
            );
            getUserLastActiveProject();
        },
        failureMessage: 'Failed to delete project.',
    });

    const handleProjectDeleteConfirmCancel = useCallback(() => {
        hideDeleteProjectConfirmation();
        setProjectTitleToDelete(undefined);
    }, [hideDeleteProjectConfirmation]);

    const handleProjectDeleteConfirm = useCallback(() => {
        triggerProjectDelete(null);
    }, [triggerProjectDelete]);

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

    const pending = projectDetailsLoading
        || createProjectPending
        || updateProjectPending;

    const disabled = pending;

    const handleSubmit = useCallback(
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
        [setError, validate, createProject, projectId, updateProject],
    );

    const projectDetails = projectDetailsResponse?.project;

    return (
        <div className={styles.projectDetails}>
            <SubNavbarActions>
                <Button
                    disabled={disabled || pristine}
                    onClick={handleSubmit}
                    variant="primary"
                    name="save"
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
                        onChange={setFieldValue}
                        value={value?.title}
                        error={error?.title}
                        label={_ts('projectEdit', 'projectTitle')}
                        placeholder={_ts('projectEdit', 'projectTitle')}
                        autoFocus
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
                        heading={_ts('projectEdit', 'projectVisibility')}
                        inlineHeadingDescription
                        headerDescriptionClassName={styles.infoIconContainer}
                        headingDescription={(
                            <IoInformationCircleOutline
                                className={styles.infoIcon}
                                title="Private projects will be visible to only project members."
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
                    <Switch
                        name="hasPubliclyViewableLeads"
                        value={value?.hasPubliclyViewableLeads}
                        onChange={setFieldValue}
                        label="Make all sources publicly viewable"
                    />
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
                    <Button
                        name="deleteProject"
                        disabled={(
                            !projectId
                            || projectDeletePending
                            || userLastActiveProjectPending
                        )}
                        onClick={showDeleteProjectConfirmation}
                        icons={(
                            <IoTrashBinOutline />
                        )}
                    >
                        {_ts('projectEdit', 'deleteProjectButtonLabel')}
                    </Button>
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
        </div>
    );
}

export default ProjectDetailsForm;
