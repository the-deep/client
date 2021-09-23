import React, { useCallback, useState, useMemo } from 'react';
import {
    _cs,
    isDefined,
    caseInsensitiveSubmatch,
    isTruthyString,
} from '@togglecorp/fujs';
import {
    TextInput,
    Container,
    ListView,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';
import {
    SetValueArg,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';

import _ts from '#ts';
import LeadEditForm from '#components/lead/LeadEditForm';
import LeadPreview from '#components/lead/LeadPreview';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import {
    LeadType,
    LeadOptionsQuery,
    LeadOptionsQueryVariables,
} from '#generated/types';

import { PartialLeadType } from '../schema';
import FileItem from './FileItem';

import styles from './styles.css';

const keySelector = (d: PartialLeadType): string => d.clientId;
const LEAD_OPTIONS = gql`
    query LeadOptions {
        leadPriorityOptions: __type(name: "LeadPriorityEnum") {
            enumValues {
                name
                description
            }
        }
    }
`;

interface Props {
    className?: string;
    leads: PartialLeadType[] | undefined;
    selectedLead: string | undefined;
    onLeadRemove: (clientId: string) => void;
    onSelectedLeadChange: (newLead: string) => void;
    selectedLeadAttachment: LeadType['attachment'];
    onLeadChange: (val: SetValueArg<PartialLeadType> | undefined, name: number) => void;
    projectId: string;
}

function FilesUploaded(props: Props) {
    const {
        className,
        onLeadRemove,
        leads,
        selectedLead,
        onSelectedLeadChange,
        selectedLeadAttachment,
        projectId,
        onLeadChange,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();

    const {
        loading: leadOptionsPending,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>();

    const [
        sourceOrganizationOptions,
        setSourceOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        authorOrganizationOptions,
        setAuthorOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        leadGroupOptions,
        setLeadGroupOptions,
    ] = useState<BasicLeadGroup[] | undefined | null>(undefined);

    const fileRendererParams = useCallback((
        _: string,
        data: PartialLeadType,
    ) => ({
        data,
        isSelected: data.clientId === selectedLead,
        onSelect: onSelectedLeadChange,
        onLeadRemove,
    }), [onLeadRemove, onSelectedLeadChange, selectedLead]);

    const searchedFiles = useMemo(() => {
        if (isTruthyString(searchText)) {
            return leads?.filter((file) => (
                caseInsensitiveSubmatch(file.title, searchText)
            ));
        }
        return leads;
    }, [leads, searchText]);

    const selectedLeadIndex = useMemo(() => (
        leads?.findIndex((f) => f.clientId === selectedLead)
    ), [leads, selectedLead]);

    const selectedLeadValue = isDefined(selectedLeadIndex) ? leads?.[selectedLeadIndex] : undefined;

    return (
        <div className={_cs(className, styles.filesUploadedDetails)}>
            <Container
                className={styles.filesContainer}
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                headerDescription={(
                    <TextInput
                        className={styles.search}
                        icons={<IoSearch className={styles.icon} />}
                        name="Search"
                        onChange={setSearchText}
                        value={searchText}
                        placeholder="Search"
                        autoFocus
                    />
                )}
                contentClassName={styles.files}
            >
                <ListView
                    className={styles.list}
                    data={searchedFiles}
                    renderer={FileItem}
                    keySelector={keySelector}
                    rendererParams={fileRendererParams}
                />
            </Container>
            <div className={styles.rightPane}>
                {selectedLeadValue && isDefined(selectedLeadIndex) && (
                    <LeadEditForm
                        name={selectedLeadIndex}
                        pending={leadOptionsPending}
                        value={selectedLeadValue}
                        onChange={onLeadChange}
                        projectId={projectId}
                        // error={riskyError}
                        defaultValue={selectedLeadValue}
                        attachment={selectedLeadAttachment}
                        priorityOptions={leadOptions?.leadPriorityOptions?.enumValues}
                        sourceOrganizationOptions={sourceOrganizationOptions}
                        onSourceOrganizationOptionsChange={setSourceOrganizationOptions}
                        authorOrganizationOptions={authorOrganizationOptions}
                        onAuthorOrganizationOptionsChange={setAuthorOrganizationOptions}
                        leadGroupOptions={leadGroupOptions}
                        onLeadGroupOptionsChange={setLeadGroupOptions}
                        assigneeOptions={projectUserOptions}
                        onAssigneeOptionChange={setProjectUserOptions}
                    />
                )}
                {selectedLeadAttachment && (
                    <LeadPreview
                        className={styles.leadPreview}
                        attachment={selectedLeadAttachment}
                    />
                )}
            </div>
        </div>
    );
}

export default FilesUploaded;
