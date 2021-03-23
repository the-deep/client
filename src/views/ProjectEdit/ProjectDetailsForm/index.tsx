import React, { useState, useCallback } from 'react';
import Faram, { requiredCondition, dateCondition } from '@togglecorp/faram';
import { formatDateToString, listToGroupList } from '@togglecorp/fujs';

import ListView from '#rsu/../v2/View/ListView';
import Icon from '#rscg/Icon';
import Button from '#dui/Button';
import DateInput from '#rsci/DateInput';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import TextArea from '#rsci/TextArea';
import SelectInput from '#rsci/SelectInput';
import Container from '#dui/Container';
import OrganizationList from '#components/general/OrganizationList';
import AddStakeholdersButton, { StakeholderType, stakeholderTypes } from '#components/general/AddStakeholdersButton';
import Tag from '#dui/Tag';


import {
    FaramErrors,
    ProjectDetails,
} from '#typings';

import _ts from '#ts';
import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';

import styles from './styles.scss';

interface Feature {
    id: string;
    title: string;
}

const additionalFeatures: Feature[] = [];
const featureKeySelector = (d: Feature) => d.id;
const featureLabelSelector = (d: Feature) => d.title;
const stakeholderTypeKeySelector = (d: StakeholderType) => d.id;

function ProjectDetailsForm() {
    const schema = {
        fields: {
            title: [requiredCondition],
            startDate: [dateCondition],
            endDate: [dateCondition],
        },
    };

    const pending = false;
    const [pristine, setPristine] = useState<boolean>(false);
    const [faramValues, setFaramValues] = useState<ProjectDetails>();
    const [faramErrors, setFaramErrors] = useState<FaramErrors>();

    const [
        projectPending,
    ] = useRequest<ProjectDetails>({
        url: 'server://projects/10/', // TODO: use dynamic
        method: 'GET',
        autoTrigger: true,
        onSuccess: (response) => {
            setFaramValues(response);
        },
        onFailure: (_, errorBody) =>
            notifyOnFailure('projectEdit')({ error: errorBody }), // TODO: use translations
    });

    const handleFaramChange = useCallback((newValues, newErrors) => {
        setPristine(false);
        setFaramValues(newValues);
        setFaramErrors(newErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((f, v) => {
        console.warn('f', f, v);
    }, []);

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
            disabled={pending}
            onValidationSuccess={handleFaramValidationSuccess}
            onValidationFailure={setFaramErrors}
            onChange={handleFaramChange}
        >
            <NonFieldErrors faramElement />
            <div className={styles.content}>
                <div className={styles.main}>
                    <TextInput
                        className={styles.input}
                        faramElementName="title"
                        label="Project title *"
                        placeholder="Project title *"
                        autoFocus
                    />
                    <div className={styles.dates}>
                        <DateInput
                            className={styles.input}
                            faramElementName="startDate"
                            label="Start date *"
                            placeholder="Start date *"
                        />
                        <DateInput
                            className={styles.input}
                            faramElementName="endDate"
                            label="End date *"
                            placeholder="End date *"
                        />
                    </div>
                    <TextArea
                        className={styles.input}
                        faramElementName="description"
                        label="Description *"
                        placeholder="Description *"
                        rows="3"
                    />
                    <div className={styles.projectTags}>
                        <Container
                            className={styles.tags}
                            headingClassName={styles.heading}
                            contentClassName={styles.items}
                            heading="Project status"
                        >
                            <Tag
                                className={styles.firstTag}
                                variant={faramValues?.status ? 'complement1' : 'default'}
                            >
                                Active
                            </Tag>
                            <Tag variant={faramValues?.status ? 'complement1' : 'default'}>
                                Inactive
                            </Tag>
                        </Container>
                        <Container
                            className={styles.tags}
                            headingClassName={styles.heading}
                            contentClassName={styles.items}
                            heading="Project visibility"
                        >
                            <Tag
                                className={styles.firstTag}
                                variant={faramValues?.isPrivate ? 'default' : 'complement1'}
                            >
                                Public
                            </Tag>
                            {faramValues?.isPrivate ? (
                                <Tag
                                    className={styles.activeStatus}
                                    variant="complement1"
                                >
                                    Private
                                </Tag>
                            ) : (
                                <Button
                                    actions={(
                                        <Icon name="arrowForward" />
                                    )}
                                    variant="tertiary"
                                >
                                    Request a private project
                                </Button>
                            )}
                        </Container>
                    </div>
                    <SelectInput
                        className={styles.input}
                        faramElementName="additionalFeatures"
                        label="Additional features"
                        options={additionalFeatures}
                        keySelector={featureKeySelector}
                        labelSelector={featureLabelSelector}
                    />
                    <Container
                        className={styles.stakeholders}
                        headingClassName={styles.heading}
                        heading="Stakeholders"
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
                            label="Created by"
                            disabled
                        />
                        {faramValues?.createdAt && (
                            <DateInput
                                className={styles.input}
                                value={formatDateToString(new Date(faramValues?.createdAt), 'dd-MM-yyyy')}
                                label="Created on"
                                disabled
                            />
                        )}
                    </div>
                </div>
                <div className={styles.map}>
                    map
                </div>
            </div>
        </Faram>
    );
}

export default ProjectDetailsForm;
