import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
    Prompt,
    useHistory,
    generatePath,
} from 'react-router-dom';
import {
    IoInformationCircleOutline,
    IoTrashBinOutline,
} from 'react-icons/io5';
import {
    Button,
    Container,
    ContainerCard,
    PendingMessage,
    TextInput,
    DateInput,
    TextArea,
    ListView,
    SegmentInput,
    Modal,
    useAlert,
} from '@the-deep/deep-ui';
import {
    isDefined,
    isNotDefined,
    listToGroupList,
    compareDate,
} from '@togglecorp/fujs';
import {
    ArraySchema,
    ObjectSchema,
    requiredStringCondition,
    defaultUndefinedType,
    useForm,
    requiredCondition,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import { SubNavbarActions } from '#components/SubNavbar';
import NonFieldError from '#components/NonFieldError';
import UserContext from '#base/context/UserContext';
import AddStakeholderButton from '#components/general/AddStakeholderButton';
import { BasicProjectOrganization } from '#components/general/AddStakeholderModal';
import {
    BasicOrganization,
    KeyValueElement,
    ProjectDetails,
    OrganizationTypes,
} from '#types';
import routes from '#base/configs/routes';
import { useModalState } from '#hooks/stateManagement';

import _ts from '#ts';
import {
    useLazyRequest,
    useRequest,
} from '#base/utils/restRequest';

import StakeholderList, { organizationTitleSelector } from './StakeholderList';
import RequestPrivateProjectButton from './RequestPrivateProjectButton';

import styles from './styles.css';

interface StakeholderType {
    id: OrganizationTypes;
    label: string;
}

const stakeholderTypes: StakeholderType[] = [
    {
        label: _ts('project.detail.stakeholders', 'leadOrganization'),
        id: 'lead_organization',
    },
    {
        label: _ts('project.detail.stakeholders', 'internationalPartner'),
        id: 'international_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'nationalPartner'),
        id: 'national_partner',
    },
    {
        label: _ts('project.detail.stakeholders', 'donor'),
        id: 'donor',
    },
    {
        label: _ts('project.detail.stakeholders', 'government'),
        id: 'government',
    },
];

const projectVisibilityOptions: KeyValueElement[] = [
    {
        key: 'false',
        value: _ts('projectEdit', 'publicProject'),
    },
    {
        key: 'true',
        value: _ts('projectEdit', 'privateProject'),
    },
];

const projectVisibilityKeySelector = (v: KeyValueElement): string => v.key;
const projectVisibilityLabelSelector = (v: KeyValueElement): string => v.value;

type FormType = {
    id?: number;
    title?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    hasAssessments?: boolean;
    isPrivate?: string;
    organizations?: BasicProjectOrganization[];
}

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type StakeholderSchema = ObjectSchema<BasicProjectOrganization, FormType>;
type StakeholderSchemaFields = ReturnType<StakeholderSchema['fields']>;
const organizationSchema: StakeholderSchema = {
    fields: (): StakeholderSchemaFields => ({
        organization: [requiredCondition],
        organizationType: [requiredCondition],
    }),
};

type StakeholderListSchema = ArraySchema<BasicProjectOrganization, FormType>;
type StakeholderListMember = ReturnType<StakeholderListSchema['member']>;
const organizationListSchema: StakeholderListSchema = {
    keySelector: (d) => d.organization,
    member: (): StakeholderListMember => organizationSchema,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        title: [requiredStringCondition],
        startDate: [],
        endDate: [],
        description: [],
        hasAssessments: [],
        organizations: organizationListSchema,
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

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

const initialValue: FormType = {
    isPrivate: 'false',
    hasAssessments: false,
};

interface Props {
    projectId: string | undefined;
    onCreate: (value: ProjectDetails) => void;
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

    const accessPrivateProject = !!user?.accessibleFeatures?.some((f) => f.key === 'PRIVATE_PROJECT');

    const [
        isDeleteModalVisible,
        showDeleteProjectConfirmation,
        hideDeleteProjectConfirmation,
    ] = useModalState(false);

    const error = getErrorObject(riskyError);

    const [projectTitleToDelete, setProjectTitleToDelete] = useState<string | undefined>();
    const [projectDetails, setProjectDetails] = useState<ProjectDetails | undefined>();
    const [stakeholderOptions, setStakeholderOptions] = useState<BasicOrganization[]>([]);

    // FIXME: we may not need this use effect
    useEffect(
        () => {
            setValue((): FormType => (
                projectDetails ? {
                    ...projectDetails,
                    isPrivate: projectDetails.isPrivate.toString(),
                    organizations: getOrganizationValues(projectDetails),
                } : initialValue
            ));
            setError({});
        },
        [projectDetails, setError, setValue],
    );

    const {
        pending: pendingProjectDetailsGet,
    } = useRequest<ProjectDetails>({
        skip: isNotDefined(projectId),
        url: `server://projects/${projectId}/`,
        method: 'GET',
        onSuccess: (response) => {
            setProjectDetails(response);
            const options = getOrganizationOptions(response);
            setStakeholderOptions(options);
            setError({});
        },
    });

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails, { values: FormType; }>({
        url: projectId ? `server://projects/${projectId}/` : 'server://projects/',
        method: projectId ? 'PATCH' : 'POST',
        body: (ctx) => ctx.values,
        onSuccess: (response) => {
            // FIXME: better to use context instead of mutable props
            if (!projectId) {
                // Set this as pristine so the prompt will not be trigger
                setPristine(true);
                onCreate(response);
            } else {
                setProjectDetails(response);
                const options = getOrganizationOptions(response);
                setStakeholderOptions(options);
            }
            alert.show(
                projectId
                    ? 'Successfully updated changes.'
                    : 'Successfully created project.',
                { variant: 'success' },
            );
        },
        failureMessage: projectId
            ? 'Failed to update changes.'
            : 'Failed to create project.',
    });

    const {
        pending: projectDeletePending,
        trigger: triggerProjectDelete,
    } = useLazyRequest<ProjectDetails>({
        url: projectId ? `server://projects/${projectId}/` : undefined,
        method: 'DELETE',
        onSuccess: () => {
            const homePath = generatePath(routes.home.path, {});
            // NOTE: Pristine is set as if the project is deleted, we don't want confirm prompt
            setPristine(true);
            history.replace(homePath);
            alert.show(
                'Successfully deleted project.',
                { variant: 'error' },
            );
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

            value?.organizations ?? [],
            (o) => o.organizationType,
            (o) => o.organization,
        ),
        [value],
    );

    const organizationListRendererParams = useCallback(
        (key: OrganizationTypes, v: StakeholderType) => {
            const organizations = groupedStakeholders[key];
            return {
                data: organizations
                    ?.map((o) => stakeholderOptions.find((option) => option.id === o))
                    .filter(isDefined),
                title: v.label,
                dataPending: pendingProjectDetailsGet,
            };
        },
        [groupedStakeholders, stakeholderOptions, pendingProjectDetailsGet],
    );

    const pending = pendingProjectDetailsGet || projectPatchPending || projectDeletePending;
    const disabled = pending;

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => projectPatch({ values: val }),
            );
            submit();
        },
        [setError, validate, projectPatch],
    );

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
                        <SegmentInput
                            className={styles.segmentInput}
                            name="isPrivate"
                            value={value?.isPrivate}
                            options={projectVisibilityOptions}
                            keySelector={projectVisibilityKeySelector}
                            labelSelector={projectVisibilityLabelSelector}
                            onChange={setFieldValue}
                            disabled={isDefined(projectId) || !accessPrivateProject}
                        />
                        { !accessPrivateProject && !isDefined(projectId) && (
                            <RequestPrivateProjectButton />
                        )}
                    </Container>
                    {/*
                    <Container
                        className={styles.features}
                        contentClassName={styles.items}
                        headingSize="extraSmall"
                        heading={_ts('projectEdit', 'projectAdditionalFeatures')}
                    >
                        <Checkbox
                            name="hasAssessments"
                            disabled={disabled}
                            onChange={setFieldValue}
                            value={value?.hasAssessments}
                            // error={error?.hasAssessments}
                            label={_ts('projectEdit', 'projectAssessmentRegistry')}
                        />
                    </Container>
                    */}
                    <div className={styles.createdByDetails}>
                        {projectDetails?.createdByName && (
                            <TextInput
                                name="createdByName"
                                className={styles.input}
                                label={_ts('projectEdit', 'projectCreatedBy')}
                                value={projectDetails.createdByName}
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
                        disabled={!projectId || projectDeletePending}
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
                                        variant="secondary"
                                    >
                                        {_ts('projectEdit', 'cancelButtonLabel')}
                                    </Button>
                                    <Button
                                        name="delete"
                                        onClick={handleProjectDeleteConfirm}
                                        disabled={projectDetails?.title !== projectTitleToDelete}
                                    >
                                        {_ts('projectEdit', 'deleteProjectButtonLabel')}
                                    </Button>
                                </>
                            )}
                        >
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
                when={!pristine}
                message={_ts('common', 'youHaveUnsavedChanges')}
            />
        </div>
    );
}

export default ProjectDetailsForm;
