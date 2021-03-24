import React, { useState, useCallback } from 'react';
import Faram, { requiredCondition, dateCondition } from '@togglecorp/faram';
import { formatDateToString, listToGroupList } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import Checkbox from '#rsci/Checkbox';
import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import DateInput from '#rsci/DateInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import Button from '#dui/Button';
import Footer from '#dui/Footer';
import Container from '#dui/Container';
import Tag from '#dui/Tag';
import OrganizationList from '#components/general/OrganizationList';
import AddStakeholdersButton, { StakeholderType, stakeholderTypes } from '#components/general/AddStakeholdersButton';

import {
    FaramErrors,
    ProjectDetails,
} from '#typings';

import _ts from '#ts';
import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import styles from './styles.scss';

interface Props {
    projectId: number;
}
const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

function ProjectDetailsForm(props: Props) {
    const { projectId } = props;
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

    const [pristine, setPristine] = useState<boolean>(false);
    const [faramValues, setFaramValues] = useState<ProjectDetails>();
    const [finalValues, setFinalValues] = useState<Partial<ProjectDetails>>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

    const [
        projectGetPending,
    ] = useRequest<ProjectDetails>({
        url: `server://projects/${projectId}/`,
        method: 'GET',
        autoTrigger: true,
        onSuccess: (response) => {
            setFaramValues(response);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
    });

    const [
        projectPatchPending,
        ,
        ,
        projectPatch,
    ] = useRequest<ProjectDetails>({
        url: `server://projects/${projectId}/`,
        method: 'PATCH',
        body: finalValues,
        onSuccess: (response) => {
            setFaramValues(response);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('projectEdit', 'projectDetailsLabel'))({ error: errorBody }),
    });

    const handleFaramChange = useCallback((newValues, newErrors) => {
        setPristine(false);
        setFaramValues(newValues);
        setFaramErrors(newErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, values) => {
        setFinalValues(values);
        projectPatch();
    }, [projectPatch]);

    const organizationListRendererParams = useCallback((key) => {
        const values = listToGroupList(
            faramValues?.organizations ?? [],
            o => o.organizationType,
            o => o,
        );

        const value = values[key] ?? [];

        return { data: value };
    }, [faramValues]);

    return (
        <Faram
            className={styles.projectDetails}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={projectGetPending}
            onValidationSuccess={handleFaramValidationSuccess}
            onValidationFailure={setFaramErrors}
            onChange={handleFaramChange}
        >
            {(projectGetPending || projectPatchPending) && <LoadingAnimation />}
            <NonFieldErrors faramElement />
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
                        className={styles.input}
                        faramElementName="description"
                        label={_ts('projectEdit', 'projectDescription')}
                        placeholder={_ts('projectEdit', 'projectDescription')}
                        rows="2"
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
                                <Button
                                    actions={(
                                        <Icon name="arrowForward" />
                                    )}
                                    variant="tertiary"
                                >
                                    {_ts('projectEdit', 'requestPrivateProject')}
                                </Button>
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
                            faramElementName="hasAssessments"
                            label={_ts('projectEdit', 'projectAssessmentRegistry')}
                        />
                    </Container>
                    <Container
                        className={styles.stakeholders}
                        headingClassName={styles.heading}
                        heading={_ts('projectEdit', 'projectStakeholders')}
                        headerActions={<AddStakeholdersButton />}
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
                    </Container>
                    <div className={styles.createdByDetails}>
                        <TextInput
                            className={styles.input}
                            faramElementName="createdByName"
                            label={_ts('projectEdit', 'projectCreatedBy')}
                            disabled
                        />
                        {faramValues?.createdAt && (
                            <DateInput
                                className={styles.input}
                                value={formatDateToString(new Date(faramValues?.createdAt), 'dd-MM-yyyy')}
                                label={_ts('projectEdit', 'projectCreatedOn')}
                                disabled
                            />
                        )}
                    </div>
                </div>
                <div className={styles.map}>
                    map
                </div>
            </div>
            <Footer
                className={styles.footer}
                actions={(
                    <Button
                        disabled={pristine || projectGetPending || projectPatchPending}
                        type="submit"
                        variant="primary"
                    >
                        {_ts('projectEdit', 'projectSave')}
                    </Button>
                )}
            />
        </Faram>
    );
}

export default ProjectDetailsForm;
