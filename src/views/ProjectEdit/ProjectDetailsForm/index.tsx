import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Redirect } from 'react-router-dom';
import { pathNames } from '#constants';
import Faram, {
    requiredCondition,
    FaramInputElement,
    dateCondition,
} from '@togglecorp/faram';
import {
    Button,
    Container,
    ContainerCard,
    Link,
    Tag,
    Footer,
    PendingMessage,
    TextInput as TextInputFromDui,
    DateInput as DateInputFromDui,
    TextArea as TextAreaFromDui,
    Checkbox as CheckboxFromDui,
} from '@the-deep/deep-ui';
import {
    listToGroupList,
    reverseRoute,
} from '@togglecorp/fujs';

import {
    setActiveProjectAction,
    activeUserSelector,
    setProjectAction,
} from '#redux';
import ListView from '#rsu/../v2/View/ListView';
import NonFieldErrors from '#rsci/NonFieldErrors';
import OrganizationList from '#components/general/OrganizationList';
import AddStakeholdersButton, { StakeholderType, stakeholderTypes } from '#components/general/AddStakeholdersButton';
import {
    AppState,
    FaramErrors,
    ProjectDetails,
} from '#typings';

import _ts from '#ts';
import { useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import styles from './styles.scss';

const TextInput = FaramInputElement(TextInputFromDui);
const Checkbox = FaramInputElement(CheckboxFromDui);
const TextArea = FaramInputElement(TextAreaFromDui);
const DateInput = FaramInputElement(DateInputFromDui);

interface Props {
    projectId: number;
    projectDetails?: ProjectDetails;
    pending?: boolean;
}

interface PropsFromDispatch {
    setUserProject: typeof setProjectAction;
    setActiveProject: typeof setActiveProjectAction;
}

interface PropsFromState {
    activeUser: { userId: number };
}
const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

const schema = {
    fields: {
        title: [requiredCondition],
        startDate: [dateCondition],
        endDate: [dateCondition],
        description: [],
        organizations: [],
        hasAssessments: [],
    },
};

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    setUserProject: params => dispatch(setProjectAction(params)),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

function ProjectDetailsForm(props: Props & PropsFromDispatch & PropsFromState) {
    const {
        activeUser: {
            userId,
        },
        projectId,
        setUserProject,
        setActiveProject,
        projectDetails,
        pending,
    } = props;

    const [pristine, setPristine] = useState<boolean>(true);
    const [faramValues, setFaramValues] = useState<Partial<ProjectDetails>>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();
    const [redirectId, setRedirectId] = useState<number | undefined>();

    useEffect(() => {
        setFaramValues(projectDetails);
    }, [projectDetails]);

    const {
        pending: projectPatchPending,
        trigger: projectPatch,
    } = useLazyRequest<ProjectDetails, unknown>({
        url: projectId ? `server://projects/${projectId}/` : 'server://projects/',
        method: projectId ? 'PATCH' : 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            if (!projectId) {
                const { id } = response;
                setActiveProject({ activeProject: id });
                setUserProject({ project: response, userId });
                setRedirectId(id);
            } else {
                setFaramValues(response);
            }
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
    });

    const handleFaramChange = useCallback((
        newValues: Partial<ProjectDetails>,
        newErrors: FaramErrors,
    ) => {
        setPristine(false);
        setFaramValues(newValues);
        setFaramErrors(newErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, values: Partial<ProjectDetails>) => {
        projectPatch({ ...values, organizations: values.organizations ?? [] });
    }, [projectPatch]);

    const groupedOrganizations = useMemo(() => (
        listToGroupList(
            faramValues?.organizations ?? [],
            o => o.organizationType,
            o => o,
        )
    ), [faramValues]);

    const organizationListRendererParams = useCallback((key: string, v: StakeholderType) => {
        const organizations = groupedOrganizations[key];

        return { data: organizations, title: v.label };
    }, [groupedOrganizations]);

    if (redirectId) {
        const newRoute = reverseRoute(pathNames.editProject, {
            redirectId,
        });
        return (
            <Redirect
                to={newRoute}
            />
        );
    }

    return (
        <Faram
            className={styles.projectDetails}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={pending}
            onValidationSuccess={handleFaramValidationSuccess}
            onValidationFailure={setFaramErrors}
            onChange={handleFaramChange}
        >
            {projectPatchPending && <PendingMessage />}
            <NonFieldErrors
                faramElement
                persistent={false}
            />
            <div className={styles.content}>
                <div className={styles.main}>
                    <TextInput
                        className={styles.input}
                        faramElementName="title"
                        label={_ts('projectEdit', 'projectTitle')}
                        placeholder={_ts('projectEdit', 'projectTitle')}
                        autoFocus
                    />
                    <div className={styles.dates}>
                        <DateInput
                            className={styles.dateInput}
                            faramElementName="startDate"
                            label={_ts('projectEdit', 'projectStartDate')}
                            placeholder={_ts('projectEdit', 'projectStartDate')}
                        />
                        <DateInput
                            className={styles.dateInput}
                            faramElementName="endDate"
                            label={_ts('projectEdit', 'projectEndDate')}
                            placeholder={_ts('projectEdit', 'projectEndDate')}
                        />
                    </div>
                    <TextArea
                        name="this-is-not-used"
                        className={styles.input}
                        faramElementName="description"
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
                                variant={faramValues?.status ? 'complement1' : 'default'}
                            >
                                {_ts('projectEdit', 'activeProject')}
                            </Tag>
                            <Tag variant={faramValues?.status ? 'default' : 'complement1'}>
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
                                variant={faramValues?.isPrivate ? 'default' : 'complement1'}
                            >
                                {_ts('projectEdit', 'publicProject')}
                            </Tag>
                            {faramValues?.isPrivate ? (
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
                            name="this-is-not-used"
                            faramElementName="hasAssessments"
                            label={_ts('projectEdit', 'projectAssessmentRegistry')}
                        />
                    </Container>
                    <ContainerCard
                        className={styles.stakeholders}
                        headerClassName={styles.header}
                        headingClassName={styles.heading}
                        heading={_ts('projectEdit', 'projectStakeholders')}
                        headerActions={<AddStakeholdersButton />}
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
                                className={styles.input}
                                label={_ts('projectEdit', 'projectCreatedBy')}
                                value={projectDetails.createdByName}
                                readOnly
                            />
                        )}
                        {projectDetails?.createdAt && (
                            <DateInput
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
                        disabled={pristine || projectPatchPending}
                        type="submit"
                        variant="primary"
                        name="projectSave"
                    >
                        {_ts('projectEdit', 'projectSave')}
                    </Button>
                )}
            />
        </Faram>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDetailsForm);
