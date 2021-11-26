import React, { useState, useMemo, useCallback } from 'react';

import { _cs } from '@togglecorp/fujs';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Modal,
    ListView,
    SearchMultiSelectInput,
    TextOutput,
    ConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import {
    ProjectListForLeadCopyQuery,
    ProjectListForLeadCopyQueryVariables,
    ProjectDetailsForLeadCopyQuery,
    ProjectDetailsForLeadCopyQueryVariables,
    LeadCopyMutation,
    LeadCopyMutationVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

import styles from './styles.css';

const PROJECT_LIST_FOR_LEAD_COPY = gql`
    query ProjectListForLeadCopy($search: String) {
        projects(search: $search){
            results {
                id
                title
            }
            totalCount
        }
    }
`;

const PROJECT_DETAILS_FOR_LEAD_COPY = gql`
    query ProjectDetailsForLeadCopy($ids: [ID!]) {
        projects(ids: $ids) {
            results {
                id
                title
            }
        }
    }
`;

const LEAD_COPY = gql`
    mutation LeadCopy(
        $activeProjectId: ID!,
        $projectIds: [ID!]!,
        $leadIds: [ID!]!,
    ) {
        project(id: $activeProjectId) {
            leadCopy(data: {
                projects: $projectIds,
                leads: $leadIds,
            }) {
                errors
                ok
            }
        }
    }
`;

type ProjectItem = NonNullable<NonNullable<NonNullable<ProjectListForLeadCopyQuery['projects']>['results']>[number]>;

const searchProjectsKeySelector = (d: ProjectItem) => d.id;
const searchProjectsLabelSelector = (d: ProjectItem) => d.title;
const selectedProjectsKeySelector = (d: ProjectItem) => d.id;

interface SelectedProjectsProps {
    title: string;
}
function SelectedProjectsRenderer(props: SelectedProjectsProps) {
    const {
        title,
    } = props;
    return (
        <>
            {title}
        </>
    );
}

interface Props {
    onClose: () => void;
    leadId: string[];
    projectId: string;
}

function LeadCopyModal(props: Props) {
    const {
        onClose,
        projectId,
        leadId,
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const alert = useAlert();

    const searchProjectsVariables = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [projectOptions, setProjectOptions] = useState<ProjectItem[] | undefined | null>([]);

    const {
        loading,
        data,
    } = useQuery<ProjectListForLeadCopyQuery, ProjectListForLeadCopyQueryVariables>(
        PROJECT_LIST_FOR_LEAD_COPY,
        {
            variables: searchProjectsVariables,
            skip: !opened,
            onCompleted: (response) => {
                const userProjects = response?.projects?.results;
                const filteredProjects = userProjects?.filter(
                    (u: ProjectItem) => u.id !== projectId,
                );
                setProjectOptions(filteredProjects);
            },
        },
    );

    const [
        leadCopy,
    ] = useMutation<LeadCopyMutation, LeadCopyMutationVariables>(
        LEAD_COPY,
        {
            onCompleted: () => {
                alert.show(
                    'Successfully copied leads to projects',
                    {
                        variant: 'success',
                    },
                );
            },
            onError: () => {
                alert.show(
                    'Failure copying leads',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const projectDetailsVariables = useMemo(() => ({
        ids: selectedProjects,
    }), [selectedProjects]);

    const {
        loading: projectDetailPending,
        data: projectDetailData,
    } = useQuery<ProjectDetailsForLeadCopyQuery, ProjectDetailsForLeadCopyQueryVariables>(
        PROJECT_DETAILS_FOR_LEAD_COPY,
        {
            variables: projectDetailsVariables,
        },
    );
    const selectedUserProjects = projectDetailData?.projects?.results ?? [];
    const selectedProjectsRendererParams = useCallback((_, datum) => ({
        title: datum?.title,
    }), []);

    const handleCopyLeadsClick = useCallback(() => {
        leadCopy({
            variables: {
                activeProjectId: projectId,
                leadIds: leadId,
                projectIds: selectedProjects,
            },
        });
    }, [leadId, selectedProjects, leadCopy, projectId]);

    return (
        <Modal
            className={styles.leadCopyModal}
            onCloseButtonClick={onClose}
            heading="Copy leads to projects"
            footerActions={(
                <ConfirmButton
                    name="leads-copy"
                    title="Export selected sources to selected projects"
                    onConfirm={handleCopyLeadsClick}
                    message={_cs(
                        'Are you sure you want to copy ',
                        leadId.length.toString(),
                        'leads to ',
                        selectedProjects.length.toString(),
                        'projects?',
                    )}
                >
                    Export
                </ConfirmButton>
            )}
        >
            <TextOutput
                label="No. of leads to be copied"
                value={leadId?.length}
            />
            <SearchMultiSelectInput
                name="searchProjects"
                value={selectedProjects}
                className={styles.searchInput}
                keySelector={searchProjectsKeySelector}
                labelSelector={searchProjectsLabelSelector}
                onChange={setSelectedProjects}
                onSearchValueChange={setSearchText}
                options={projectOptions}
                searchOptions={projectOptions}
                onOptionsChange={setProjectOptions}
                optionsPending={loading}
                totalOptionsCount={data?.projects?.totalCount ?? undefined}
                onShowDropdownChange={setOpened}
            />
            {selectedProjects.length !== 0 && (
                <>
                    <TextOutput
                        label="Selected Projects"
                        value={selectedProjects.length}
                    />
                    <ListView
                        className={styles.list}
                        keySelector={selectedProjectsKeySelector}
                        data={selectedUserProjects}
                        renderer={SelectedProjectsRenderer}
                        rendererParams={selectedProjectsRendererParams}
                        pending={projectDetailPending}
                    />
                </>
            )}
        </Modal>
    );
}
export default LeadCopyModal;
