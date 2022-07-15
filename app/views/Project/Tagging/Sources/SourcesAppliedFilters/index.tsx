import React, { useContext } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    keySelector as projectMemberKeySelector,
    labelSelector as projectMemberLabelSelector,
} from '#components/selections/ProjectMemberMultiSelectInput';
import {
    keySelector as organizationKeySelector,
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';

import { PartialFormType } from '../SourcesFilter/schema';
import SourcesFilterContext from '../SourcesFilterContext';

import DismissableBooleanOutput from './DismissableBooleanOutput';
import DismissableDateRangeOutput from './DismissableDateRangeOutput';
import DismissableListOutput from './DismissableListOutput';
import DismissableSelectOutput from './DismissableSelectOutput';
import DismissableTextOutput from './DismissableTextOutput';
import EntryFilterOutput from './EntryFilterOutput';

import styles from './styles.css';

// FIXME: move this to utils
interface KeyLabel {
    id: string;
    title: string;
}
const organizationTypeKeySelector = (d: KeyLabel): number => d.id;
const organizationTypeLabelSelector = (d: KeyLabel): string => d.title;

interface Props {
    value: PartialFormType;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    className?: string;
}

function SourcesAppliedFilters(props: Props) {
    const {
        className,
        value,
        onChange,
    } = props;

    const {
        createdByOptions,
        assigneeOptions,
        authorOrganizationOptions,
        sourceOrganizationOptions,
        statusOptions,
        priorityOptions,
        organizationTypeOptions,
        confidentialityOptions,
        entryTypeOptions,
        frameworkFilters,
    } = useContext(SourcesFilterContext);

    return (
        <div className={_cs(className, styles.appliedFilters)}>
            <DismissableTextOutput
                label="Title"
                name="search"
                value={value.search}
                onDismiss={onChange}
            />
            <DismissableListOutput
                label="Status"
                name="statuses"
                onDismiss={onChange}
                value={value.statuses}
                options={statusOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableDateRangeOutput
                fromName="publishedOnGte"
                onDismissFromValue={onChange}
                fromValue={value.publishedOnGte}
                toName="publishedOnLte"
                onDismissToValue={onChange}
                toValue={value.publishedOnLte}
                label="Date Published"
            />
            <DismissableDateRangeOutput
                fromName="createdAtGte"
                onDismissFromValue={onChange}
                fromValue={value.createdAtGte}
                toName="createdAtLte"
                onDismissToValue={onChange}
                toValue={value.createdAtLte}
                label="Source Date Created"
            />
            <DismissableBooleanOutput
                label="Has Entry"
                name="hasEntries"
                onDismiss={onChange}
                trueLabel="Has entry"
                falseLabel="No entries"
                value={value.hasEntries}
            />
            <DismissableBooleanOutput
                label="Assessment Status"
                name="hasAssessment"
                onDismiss={onChange}
                trueLabel="Assessment completed"
                falseLabel="Assessment not completed"
                value={value.hasAssessment}
            />
            <DismissableListOutput
                label="Source Created By"
                name="createdBy"
                onDismiss={onChange}
                value={value.createdBy}
                options={createdByOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableListOutput
                label="Assignee"
                name="assignees"
                onDismiss={onChange}
                value={value.assignees}
                options={assigneeOptions}
                labelSelector={projectMemberLabelSelector}
                keySelector={projectMemberKeySelector}
            />
            <DismissableListOutput
                label="Priority"
                name="priorities"
                onDismiss={onChange}
                value={value.priorities}
                options={priorityOptions}
                labelSelector={enumLabelSelector}
                keySelector={enumKeySelector}
            />
            <DismissableListOutput
                label="Authoring Organization Type"
                name="authoringOrganizationTypes"
                onDismiss={onChange}
                options={organizationTypeOptions}
                keySelector={organizationTypeKeySelector}
                labelSelector={organizationTypeLabelSelector}
                value={value.authoringOrganizationTypes}
            />
            <DismissableListOutput
                label="Authoring Organization"
                name="authorOrganizations"
                onDismiss={onChange}
                value={value.authorOrganizations}
                options={authorOrganizationOptions}
                labelSelector={organizationLabelSelector}
                keySelector={organizationKeySelector}
            />
            <DismissableListOutput
                label="Source Organization"
                name="sourceOrganizations"
                onDismiss={onChange}
                value={value.sourceOrganizations}
                options={sourceOrganizationOptions}
                labelSelector={organizationLabelSelector}
                keySelector={organizationKeySelector}
            />
            <DismissableSelectOutput
                label="Confidentiality"
                name="confidentiality"
                onDismiss={onChange}
                options={confidentialityOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.confidentiality}
            />
            <EntryFilterOutput
                name="entriesFilterData"
                value={value.entriesFilterData}
                onChange={onChange}
                entryTypeOptions={entryTypeOptions}
                frameworkFilters={frameworkFilters}
            />
        </div>
    );
}

export default SourcesAppliedFilters;
