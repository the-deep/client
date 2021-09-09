import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Prompt,
    useHistory,
    generatePath,
} from 'react-router-dom';
import {
    IoTrashOutline,
} from 'react-icons/io5';
import {
    Button,
    Container,
    ContainerCard,
    Footer,
    PendingMessage,
    TextInput,
    DateInput,
    TextArea,
    Checkbox,
    ListView,
    SegmentInput,
    Modal,
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
} from '@togglecorp/toggle-form';

import { SubNavbarActions } from '#components/SubNavbar';
import NonFieldError from '#components/NonFieldError';
import AddStakeholderButton from '#components/general/AddStakeholderButton';
import { BasicProjectOrganization } from '#components/general/AddStakeholderModal';
import {
    BasicOrganization,
    KeyValueElement,
    ProjectDetails,
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
    id: string;
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

type StakeholderSchema = ObjectSchema<BasicProjectOrganization>;
type StakeholderSchemaFields = ReturnType<StakeholderSchema['fields']>;
const organizationSchema: StakeholderSchema = {
    fields: (): StakeholderSchemaFields => ({
        organization: [requiredCondition],
        organizationType: [requiredCondition],
    }),
};

type StakeholderListSchema = ArraySchema<BasicProjectOrganization>;
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
    projectId: number | undefined;
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
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails, { values: FormType; type: string }>({
        url: projectId ? `server://projects/${projectId}/` : 'server://projects/',
        method: projectId ? 'PATCH' : 'POST',
        body: (ctx) => ctx.values,
        onSuccess: (response, ctx) => {
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
            if (ctx.type === 'saveAndClose') {
                history.push(generatePath(routes.tagging.path, {
                    projectId: response.id,
                }));
            }
            if (ctx.type === 'saveAndNext') {
                window.location.replace('#/geo-areas');
            }
        },
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const {
        pending: projectDeletePending,
        trigger: triggerProjectDelete,
    } = useLazyRequest<ProjectDetails>({
        url: projectId ? `server://projects/${projectId}/` : undefined,
        method: 'DELETE',
        onSuccess: () => {
            const homePath = generatePath(routes.home.path, {});
            history.replace(homePath);
        },
        failureHeader: _ts('projectEdit', 'deleteProject'),
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
        (key: string, v: StakeholderType) => {
            const organizations = groupedStakeholders[key];
            return {
                data: organizations
                    ?.map((o) => stakeholderOptions.find((option) => option.id === o))
                    .filter(isDefined),
                title: v.label,
            };
        },
        [groupedStakeholders, stakeholderOptions],
    );

    // TODO: Add private feature access here
    const accessPrivateProject = false;

    const pending = pendingProjectDetailsGet || projectPatchPending || projectDeletePending;
    const disabled = pending;

    const handleSubmit = useCallback(
        (name: string) => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                projectPatch({
                    values: val,
                    type: name,
                });
            }
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
                    name="saveAndClose"
                >
                    {_ts('projectEdit', 'saveButtonLabel')}
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
                            data={stakeholderTypes}
                            rendererParams={organizationListRendererParams}
                            renderer={StakeholderList}
                            rendererClassName={styles.organizations}
                            keySelector={stakeholderTypeKeySelector}
                        />
                    </ContainerCard>
                </div>
                <div className={styles.right}>
                    <Container
                        className={styles.visibility}
                        headingSize="extraSmall"
                        contentClassName={styles.items}
                        heading={_ts('projectEdit', 'projectVisibility')}
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
                            <IoTrashOutline />
                        )}
                    >
                        {_ts('projectEdit', 'deleteProjectButtonLabel')}
                    </Button>
                    {isDeleteModalVisible && (
                        <Modal
                            onCloseButtonClick={handleProjectDeleteConfirmCancel}
                            heading={_ts('projectEdit', 'deleteProject')}
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
            <Footer
                className={styles.footer}
                actions={(
                    <Button
                        disabled={disabled || pristine}
                        onClick={handleSubmit}
                        variant="primary"
                        name="saveAndNext"
                    >
                        {_ts('projectEdit', 'projectSave')}
                    </Button>
                )}
            />
            <Prompt
                when={!pristine}
                message={_ts('common', 'youHaveUnsavedChanges')}
            />
        </div>
    );
}

export default ProjectDetailsForm;
