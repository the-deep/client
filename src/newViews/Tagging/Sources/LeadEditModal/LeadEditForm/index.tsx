import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    unique,
    isTruthyString,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';
import {
    PendingMessage,
    TextInput,
    DateInput,
    SegmentInput,
    SelectInput,
    Checkbox,
    TextArea,
    QuickActionButton,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
    Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';
import { IoAdd } from 'react-icons/io5';

import { useRequest } from '#utils/request';
import OrganizationSelectInput from '#newComponents/input/OrganizationSelectInput';
import OrganizationMultiSelectInput from '#newComponents/input/OrganizationMultiSelectInput';
import AddOrganizationModal from '#newComponents/general/AddOrganizationModal';
import {
    useModalState,
} from '#hooks/stateManagement';
import {
    BasicOrganization,
} from '#typings';

import {
    PartialFormType,
    LeadOptions,
    Priority,
} from './schema';
import ConfidentialityInput from './ConfidentialityInput';
import EmmStats from './EmmStats';

import styles from './styles.scss';

// FIXME: Use translations throughout the page


const idSelector = (item: { id: number }) => item.id;
const titleSelector = (item: { title: string}) => item.title;
const displayNameSelector = (item: { displayName: string }) => item.displayName;

const keySelector = (item: Priority) => item.key;
const valueSelector = (item: Priority) => item.value;

interface Props {
    className?: string;
    setFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    value: PartialFormType;
    error: Error<PartialFormType> | undefined;
    initialValue: PartialFormType;
    pending?: boolean;
    ready?: boolean;
}

function LeadEditForm(props: Props) {
    const {
        className,
        value,
        initialValue,
        error: riskyError,
        setFieldValue,
        pending: pendingFromProps,
        ready,
    } = props;
    const error = getErrorObject(riskyError);

    const optionsRequestBody = useMemo(() => ({
        projects: [initialValue.project],
        leadGroups: [], // this will not fetch any leadGroups
        organizations: unique(
            [
                initialValue.source,
                ...(initialValue.authors || []),
            ].filter(isDefined),
            id => id,
        ),
    }), [initialValue]);

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    // NOTE: the loading animation flashes when loading for
    // lead-options. this will be mitigated when using graphql
    const [organizationAddType, setOrganizationAddType] = useState<'author' | 'publisher' | undefined>(undefined);

    const [
        showAddOrganizationModal,
        setAddOrganizationModalVisible,
        setAddOrganizationModalHidden,
    ] = useModalState(false);

    const {
        pending,
        response: leadOptions,
    } = useRequest<LeadOptions>({
        method: 'POST',
        url: 'server://lead-options/',
        body: optionsRequestBody,
        failureHeader: 'Lead Options',
        skip: !ready,
    });

    const sortedPriority = useMemo(() => (
        leadOptions?.priority?.sort((a, b) => compareNumber(a.key, b.key))
    ), [leadOptions?.priority]);

    const handleAddPublishingOrganizationsClick = useCallback(() => {
        setAddOrganizationModalVisible();
        setOrganizationAddType('publisher');
    }, [setAddOrganizationModalVisible]);

    const handleAddAuthorOrganizationsClick = useCallback(() => {
        setAddOrganizationModalVisible();
        setOrganizationAddType('author');
    }, [setAddOrganizationModalVisible]);

    const handleOrganizationAdd = useCallback((val: BasicOrganization) => {
        if (organizationAddType === 'publisher') {
            setFieldValue(val.id, 'source');
            setSourceOrganizationOptions(oldVal => [...oldVal ?? [], val]);
        } else if (organizationAddType === 'author') {
            setFieldValue((oldVal: number[] | undefined) => [...oldVal ?? [], val.id], 'authors');
            setAuthorOrganizationOptions(oldVal => [...oldVal ?? [], val]);
        }
    }, [organizationAddType, setFieldValue]);

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {(pending || pendingFromProps) && <PendingMessage />}
            <SelectInput
                label="Project"
                name="project"
                value={value.project}
                className={styles.input}
                onChange={setFieldValue}
                keySelector={idSelector}
                labelSelector={titleSelector}
                options={leadOptions?.projects}
                disabled
                error={error?.project}
            />
            {value.sourceType === 'website' && (
                <>
                    <TextInput
                        className={styles.input}
                        label="URL"
                        name="url"
                        value={value.url}
                        onChange={setFieldValue}
                        error={error?.url}
                    />
                    <TextInput
                        className={styles.input}
                        label="Website"
                        name="website"
                        value={value.website}
                        onChange={setFieldValue}
                        error={error?.website}
                    />
                </>
            )}
            {value.sourceType === 'text' && (
                <>
                    <TextArea
                        className={styles.input}
                        label="Text"
                        name="text"
                        value={value.text}
                        onChange={setFieldValue}
                        rows={10}
                        error={error?.text}
                    />
                </>
            )}
            <TextInput
                className={styles.input}
                label="Title"
                name="title"
                value={value.title}
                onChange={setFieldValue}
                error={error?.title}
            />
            <div className={styles.row}>
                <DateInput
                    className={styles.input}
                    label="Published On"
                    name="publishedOn"
                    value={value.publishedOn}
                    onChange={setFieldValue}
                    error={error?.publishedOn}
                />
                <SelectInput
                    className={styles.input}
                    label="Assignee"
                    name="assignee"
                    value={value.assignee}
                    onChange={setFieldValue}
                    keySelector={idSelector}
                    labelSelector={displayNameSelector}
                    options={leadOptions?.members}
                    error={error?.assignee}
                />
            </div>
            <div className={styles.row}>
                <OrganizationSelectInput
                    className={styles.input}
                    name="source"
                    value={value.source}
                    onChange={setFieldValue}
                    options={sourceOrganizationOptions ?? leadOptions?.organizations}
                    onOptionsChange={setSourceOrganizationOptions}
                    disabled={pending}
                    label="Publishing Organizations"
                    hint={isTruthyString(value.sourceRaw) && `Previous organization: ${value.sourceRaw}`}
                    error={error?.source}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddPublishingOrganizationsClick}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
                <OrganizationMultiSelectInput
                    className={styles.input}
                    name="authors"
                    value={value.authors}
                    onChange={setFieldValue}
                    options={authorOrganizationOptions ?? leadOptions?.organizations}
                    onOptionsChange={setAuthorOrganizationOptions}
                    disabled={pending}
                    label="Authoring Organizations"
                    hint={isTruthyString(value.authorRaw) && `Previous organization: ${value.authorRaw}`}
                    error={getErrorString(error?.authors)}
                    actions={(
                        <QuickActionButton
                            name="add organizations"
                            variant="transparent"
                            onClick={handleAddAuthorOrganizationsClick}
                        >
                            <IoAdd />

                        </QuickActionButton>
                    )}
                />
            </div>
            <div className={styles.row}>
                <SegmentInput
                    name="priority"
                    label="Priority"
                    value={value.priority}
                    onChange={setFieldValue}
                    options={sortedPriority}
                    keySelector={keySelector}
                    labelSelector={valueSelector}
                    className={styles.input}
                    error={error?.priority}
                />
                <div className={styles.nestedRow}>
                    <ConfidentialityInput
                        name="confidentiality"
                        className={styles.nestedInput}
                        value={value.confidentiality}
                        onChange={setFieldValue}
                        label="Confidential"
                    />
                    <Checkbox
                        className={styles.nestedInput}
                        name="isAssessmentLead"
                        value={value.isAssessmentLead}
                        onChange={setFieldValue}
                        label="Is Assessment"
                    />
                </div>
            </div>
            <EmmStats
                emmTriggers={value.emmTriggers}
                emmEntities={value.emmEntities}
            />
            {showAddOrganizationModal && (
                <AddOrganizationModal
                    onModalClose={setAddOrganizationModalHidden}
                    onOrganizationAdd={handleOrganizationAdd}
                />
            )}
        </div>
    );
}

export default LeadEditForm;
