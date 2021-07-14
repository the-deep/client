import React, { useState, useMemo } from 'react';
import {
    _cs,
    unique,
    compareNumber,
    isDefined,
} from '@togglecorp/fujs';
import {
    PendingMessage,
    TextInput,
    DateInput,
    SegmentInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    EntriesAsList,
} from '@togglecorp/toggle-form';

import { useRequest } from '#utils/request';
import OrganizationSelectInput from '#newComponents/input/OrganizationSelectInput';
import OrganizationMultiSelectInput from '#newComponents/input/OrganizationMultiSelectInput';

import { BasicOrganization } from '#typings';
import {
    PartialFormType,
    LeadOptions,
    Priority,
} from './schema';
import ConfidentialityInput from './ConfidentialityInput';

import styles from './styles.scss';

const idSelector = (item: { id: number }) => item.id;
const displayNameSelector = (item: { displayName: string }) => item.displayName;

const keySelector = (item: Priority) => item.key;
const valueSelector = (item: Priority) => item.value;

interface Props {
    className?: string;
    setFieldValue: (...values: EntriesAsList<PartialFormType>) => void;
    value: PartialFormType;
    initialValue: PartialFormType;
}

function LeadEditForm(props: Props) {
    const {
        className,
        value,
        initialValue,
        setFieldValue,
    } = props;

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

    const {
        pending,
        response: leadOptions,
    } = useRequest<LeadOptions>({
        method: 'POST',
        url: 'server://lead-options/',
        body: optionsRequestBody,
    });

    const sortedPriority = useMemo(() => (
        leadOptions?.priority?.sort((a, b) => compareNumber(a.key, b.key))
    ), [leadOptions?.priority]);

    return (
        <div className={_cs(styles.leadEditForm, className)}>
            {pending && <PendingMessage />}
            <TextInput
                label="Title"
                name="title"
                value={value?.title}
                onChange={setFieldValue}
            />
            <div className={styles.row}>
                <DateInput
                    label="Published On"
                    name="publishedOn"
                    value={value?.publishedOn}
                    onChange={setFieldValue}
                />
                <SelectInput
                    label="Assignee"
                    name="assignee"
                    value={value?.assignee}
                    onChange={setFieldValue}
                    keySelector={idSelector}
                    labelSelector={displayNameSelector}
                    options={leadOptions?.members}
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
                />
            </div>
            <div className={styles.row}>
                <SegmentInput
                    name="priority"
                    value={value?.priority}
                    onChange={setFieldValue}
                    options={sortedPriority}
                    keySelector={keySelector}
                    labelSelector={valueSelector}
                />
                <ConfidentialityInput
                    name="confidentiality"
                    value={value?.confidentiality}
                    onChange={setFieldValue}
                    label="Confidential"
                />
            </div>
        </div>
    );
}

export default LeadEditForm;
