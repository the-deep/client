import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Button,
    Container,
    ContainerCard,
    Link,
    Tag,
    Footer,
    PendingMessage,
    TextInput,
    DateInput,
    TextArea,
    Checkbox,
} from '@the-deep/deep-ui';
import {
    isNotDefined,
    listToGroupList,
} from '@togglecorp/fujs';

import {
    ObjectSchema,
    requiredStringCondition,
    idCondition,
    useForm,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import ListView from '#rsu/../v2/View/ListView';
import OrganizationList from '#components/general/OrganizationList';
import NonFieldError from '#components/ui/NonFieldError';
import { StakeholderType, stakeholderTypes } from '#components/general/AddStakeholdersButton';
import { ProjectDetails } from '#typings';

import _ts from '#ts';
import {
    useLazyRequest,
    useRequest,
} from '#utils/request';

import styles from './styles.scss';

type FormType = {
    id?: number;
    title?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    hasAssessments?: boolean;
    // TODO: @samshara to add this back after new organizations popup is completed
    // organizations?: ProjectOrganization[];
}


type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [idCondition],
        title: [requiredStringCondition],
        startDate: [],
        endDate: [],
        description: [],
        hasAssessments: [],
        // organizations: organizationListSchema,
    }),
};

const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

const initialValue: FormType = {};

interface Props {
    projectId: number;
    onCreate: (value: ProjectDetails) => void;
}

function ProjectDetailsForm(props: Props) {
    const {
        projectId,
        onCreate,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(initialValue, schema);

    const [projectDetails, setProjectDetails] = useState<ProjectDetails | undefined>();

    useEffect(
        () => {
            onValueSet(projectDetails ?? {});
            onErrorSet({});
        },
        [projectDetails, onErrorSet, onValueSet],
    );

    const {
        pending,
    } = useRequest<ProjectDetails>({
        skip: isNotDefined(projectId),
        url: `server://projects/${projectId}/`,
        method: 'GET',
        onSuccess: (response) => {
            setProjectDetails(response);
        },
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails, unknown>({
        url: projectId ? `server://projects/${projectId}/` : 'server://projects/',
        method: projectId ? 'PATCH' : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            setProjectDetails(response);
            if (!projectId) {
                onCreate(response);
            }
        },
        failureHeader: _ts('projectEdit', 'projectDetailsLabel'),
    });

    const handleSubmit = useCallback((values: FormType) => {
        projectPatch({
            ...values,
            organizations: projectDetails?.organizations ?? [],
        });
    }, [projectPatch, projectDetails]);

    const selectedOrganizations = projectDetails?.organizations;

    const groupedOrganizations = useMemo(
        () => listToGroupList(
            selectedOrganizations ?? [],
            o => o.organizationType,
            o => o,
        ),
        [selectedOrganizations],
    );

    const organizationListRendererParams = useCallback(
        (key: string, v: StakeholderType) => {
            const organizations = groupedOrganizations[key];
            return {
                data: organizations,
                title: v.label,
            };
        },
        [groupedOrganizations],
    );

    const disabled = pending || projectPatchPending;

    return (
        <form
            className={styles.projectDetails}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            {(pending || projectPatchPending) && <PendingMessage />}
            <NonFieldError error={error} />
            <div className={styles.content}>
                <div className={styles.main}>
                    <TextInput
                        className={styles.input}
                        name="title"
                        disabled={disabled}
                        onChange={onValueChange}
                        value={value?.title}
                        error={error?.fields?.title}
                        label={_ts('projectEdit', 'projectTitle')}
                        placeholder={_ts('projectEdit', 'projectTitle')}
                        autoFocus
                    />
                    <div className={styles.dates}>
                        <DateInput
                            className={styles.dateInput}
                            name="startDate"
                            disabled={disabled}
                            onChange={onValueChange}
                            value={value?.startDate}
                            error={error?.fields?.startDate}
                            label={_ts('projectEdit', 'projectStartDate')}
                            placeholder={_ts('projectEdit', 'projectStartDate')}
                        />
                        <DateInput
                            className={styles.dateInput}
                            name="endDate"
                            disabled={disabled}
                            onChange={onValueChange}
                            value={value?.endDate}
                            error={error?.fields?.endDate}
                            label={_ts('projectEdit', 'projectEndDate')}
                            placeholder={_ts('projectEdit', 'projectEndDate')}
                        />
                    </div>
                    <TextArea
                        className={styles.input}
                        name="description"
                        disabled={disabled}
                        onChange={onValueChange}
                        value={value?.description}
                        error={error?.fields?.description}
                        label={_ts('projectEdit', 'projectDescription')}
                        placeholder={_ts('projectEdit', 'projectDescription')}
                        rows={4}
                    />
                    <div className={styles.projectTags}>
                        <Container
                            className={styles.tags}
                            headingClassName={styles.heading}
                            contentClassName={styles.items}
                            heading={_ts('projectEdit', 'projectStatus')}
                        >
                            <Tag
                                className={styles.firstTag}
                                variant={projectDetails?.status === 'active' ? 'complement1' : 'default'}
                            >
                                {_ts('projectEdit', 'activeProject')}
                            </Tag>
                            <Tag
                                variant={!projectDetails?.status || projectDetails.status === 'inactive' ? 'complement1' : 'default'}
                            >
                                {_ts('projectEdit', 'inactiveProject')}
                            </Tag>
                        </Container>
                        <Container
                            className={styles.tags}
                            headingClassName={styles.heading}
                            contentClassName={styles.items}
                            heading={_ts('projectEdit', 'projectVisibility')}
                        >
                            <Tag
                                className={styles.firstTag}
                                variant={projectDetails?.isPrivate ? 'default' : 'complement1'}
                            >
                                {_ts('projectEdit', 'publicProject')}
                            </Tag>
                            {projectDetails?.isPrivate ? (
                                <Tag
                                    variant="complement1"
                                >
                                    {_ts('projectEdit', 'publicProject')}
                                </Tag>
                            ) : (
                                <Link
                                    to="mailto:pm@thedeep.io"
                                >
                                    {_ts('projectEdit', 'requestPrivateProject')}
                                </Link>
                            )}
                        </Container>
                    </div>
                    <Container
                        className={styles.features}
                        headingClassName={styles.heading}
                        contentClassName={styles.items}
                        heading={_ts('projectEdit', 'projectAdditionalFeatures')}
                    >
                        <Checkbox
                            name="hasAssessments"
                            disabled={disabled}
                            onChange={onValueChange}
                            value={value?.hasAssessments}
                            // error={error?.fields?.hasAssessments}
                            label={_ts('projectEdit', 'projectAssessmentRegistry')}
                        />
                    </Container>
                    <ContainerCard
                        className={styles.stakeholders}
                        headerClassName={styles.header}
                        headingClassName={styles.heading}
                        heading={_ts('projectEdit', 'projectStakeholders')}
                        // headerActions={<AddStakeholdersButton />}
                        contentClassName={styles.content}
                    >
                        <ListView
                            className={styles.items}
                            data={stakeholderTypes}
                            rendererParams={organizationListRendererParams}
                            renderer={OrganizationList}
                            rendererClassName={styles.organizations}
                            keySelector={stakeholderTypeKeySelector}
                            emptyComponent={null}
                        />
                    </ContainerCard>
                    <div className={styles.createdByDetails}>
                        {projectDetails?.createdByName && (
                            <TextInput
                                name="createdByName"
                                disabled={disabled}
                                className={styles.input}
                                label={_ts('projectEdit', 'projectCreatedBy')}
                                value={projectDetails.createdByName}
                                readOnly
                            />
                        )}
                        {projectDetails?.createdAt && (
                            <DateInput
                                name="createdAt"
                                disabled={disabled}
                                className={styles.input}
                                value={projectDetails.createdAt.split('T')[0]}
                                label={_ts('projectEdit', 'projectCreatedOn')}
                                readOnly
                            />
                        )}
                    </div>
                </div>
                <div className={styles.map}>
                    Map
                </div>
            </div>
            <Footer
                className={styles.footer}
                actions={(
                    <Button
                        disabled={disabled || pristine}
                        type="submit"
                        variant="primary"
                        name="projectSave"
                    >
                        {_ts('projectEdit', 'projectSave')}
                    </Button>
                )}
            />
        </form>
    );
}

export default ProjectDetailsForm;
