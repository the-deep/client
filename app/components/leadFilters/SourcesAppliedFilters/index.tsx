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
    EnumEntity,
} from '#types';
import {
    keySelector as projectMemberKeySelector,
    labelSelector as projectMemberLabelSelector,
} from '#components/selections/ProjectMemberMultiSelectInput';
import {
    keySelector as organizationKeySelector,
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import SourcesFilterContext from '#components/leadFilters/SourcesFilterContext';
import { PartialFormType } from '#components/leadFilters/SourcesFilter/schema';

import DismissableBooleanOutput from '#components/input/DismissableBooleanOutput';
import DismissableDateRangeOutput from '#components/input/DismissableDateRangeOutput';
import DismissableListOutput from '#components/input/DismissableListOutput';
import DismissableSelectOutput from '#components/input/DismissableSelectOutput';
import DismissableTextOutput from '#components/input/DismissableTextOutput';
import EntryFilterOutput from './EntryFilterOutput';

import styles from './styles.css';

// FIXME: move this to utils
interface KeyLabel {
    id: string;
    title: string;
}
const organizationTypeKeySelector = (d: KeyLabel) => d.id;
const organizationTypeLabelSelector = (d: KeyLabel) => d.title;

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
            <DismissableBooleanOutput
                label="Is Assessment"
                name="isAssessment"
                onDismiss={onChange}
                trueLabel="Marked as assessment"
                falseLabel="Not marked as assessment"
                value={value.isAssessment}
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
                label="Publishing Organization"
                name="sourceOrganizations"
                onDismiss={onChange}
                value={value.sourceOrganizations}
                options={sourceOrganizationOptions}
                labelSelector={organizationLabelSelector}
                keySelector={organizationKeySelector}
            />
            <DismissableSelectOutput<EnumEntity<string>, string, 'confidentiality'>
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
