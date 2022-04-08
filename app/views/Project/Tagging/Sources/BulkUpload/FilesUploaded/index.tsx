import React, { useContext, useCallback, useState, useMemo } from 'react';
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
    Kraken,
} from '@the-deep/deep-ui';
import { IoSearch } from 'react-icons/io5';
import {
    SetValueArg,
    Error,
    getErrorObject,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import { useQuery, gql } from '@apollo/client';

import { ProjectUserContext } from '#base/context/ProjectUserContext';
import _ts from '#ts';
import LeadInput from '#components/lead/LeadInput';
import { ProjectContext } from '#base/context/ProjectContext';
import LeadPreview from '#components/lead/LeadPreview';
import { BasicOrganization } from '#components/selections/NewOrganizationSelectInput';
import { BasicProjectUser } from '#components/selections/ProjectUserSelectInput';
import { BasicLeadGroup } from '#components/selections/LeadGroupSelectInput';
import { isFiltered } from '#utils/common';
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
    onLeadChange: (val: SetValueArg<PartialLeadType>, name: number | undefined) => void;
    projectId: string;
    leadsError: Error<PartialLeadType[]> | undefined;
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
        leadsError: riskyLeadsErrors,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const { projectUser } = useContext(ProjectUserContext);

    const {
        loading: leadOptionsPending,
        data: leadOptions,
    } = useQuery<LeadOptionsQuery, LeadOptionsQueryVariables>(
        LEAD_OPTIONS,
    );

    const { project } = useContext(ProjectContext);

    const [
        projectUserOptions,
        setProjectUserOptions,
    ] = useState<BasicProjectUser[] | undefined | null>(projectUser ? [projectUser] : undefined);

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
    ] = useState<BasicLeadGroup[] | undefined | null>();

    const currentLeadIndex = leads?.findIndex(
        (lead) => lead.clientId === selectedLead,
    ) ?? -1;

    const currentLead = leads?.[currentLeadIndex];

    const leadsError = getErrorObject(riskyLeadsErrors);

    const currentLeadError = currentLead
        ? leadsError?.[currentLead.clientId]
        : undefined;

    const fileRendererParams = useCallback((
        _: string,
        data: PartialLeadType,
    ) => ({
        data,
        isErrored: analyzeErrors(leadsError?.[data.clientId]),
        isSelected: data.clientId === selectedLead,
        onSelect: onSelectedLeadChange,
        onLeadRemove,
    }), [onLeadRemove, onSelectedLeadChange, selectedLead, leadsError]);

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
                headerClassName={styles.header}
                headingSize="small"
                heading={_ts('bulkUpload', 'sourcesUploadedTitle')}
                headerDescription={(
                    <TextInput
                        icons={<IoSearch />}
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
                    errored={false}
                    pending={false}
                    emptyIcon={(
                        <Kraken
                            variant="exercise"
                        />
                    )}
                    emptyMessage="No files to show."
                    filtered={isFiltered(searchText)}
                    filteredEmptyIcon={(
                        <Kraken
                            variant="search"
                        />
                    )}
                    filteredEmptyMessage="No match found."
                    messageIconShown
                    messageShown
                />
            </Container>
            <div className={styles.rightPane}>
                {selectedLeadValue && isDefined(selectedLeadIndex) && (
                    <LeadInput
                        name={selectedLeadIndex}
                        pending={leadOptionsPending}
                        value={selectedLeadValue}
                        onChange={onLeadChange}
                        projectId={projectId}
                        error={currentLeadError}
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
                        hasAssessment={project?.hasAssessmentTemplate}
                    />
                )}
                {selectedLeadAttachment && (
                    <LeadPreview
                        key={selectedLeadIndex}
                        className={styles.leadPreview}
                        attachment={selectedLeadAttachment}
                    />
                )}
            </div>
        </div>
    );
}

export default FilesUploaded;
