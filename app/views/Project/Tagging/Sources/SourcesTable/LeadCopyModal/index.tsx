import React, { useState, useCallback } from 'react';

import { useMutation, gql } from '@apollo/client';
import {
    Modal,
    TextOutput,
    ConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import {
    LeadCopyMutation,
    LeadCopyMutationVariables,
} from '#generated/types';
import ProjectMultiSelectInput, { BasicProject } from '#components/selections/ProjectMultiSelectInput';

import styles from './styles.css';

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

interface Props {
    onClose: () => void;
    leadIds: string[];
    projectId: string;
}

function LeadCopyModal(props: Props) {
    const {
        onClose,
        projectId,
        leadIds,
    } = props;

    const alert = useAlert();

    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [projectOptions, setProjectOptions] = useState<BasicProject[] | undefined | null>([]);

    const [
        leadCopy,
    ] = useMutation<LeadCopyMutation, LeadCopyMutationVariables>(
        LEAD_COPY,
        {
            onCompleted: (response) => {
                if (!response?.project?.leadCopy) {
                    return;
                }
                const {
                    ok,
                } = response.project.leadCopy;

                if (!ok) {
                    alert.show(
                        'Failure copying leads',
                        {
                            variant: 'error',
                        },
                    );
                }
                alert.show(
                    `Successfully copied ${leadIds.length.toString()} leads to ${selectedProjects.length.toString()} projects`,
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

    const handleCopyLeadsClick = useCallback(() => {
        leadCopy({
            variables: {
                activeProjectId: projectId,
                leadIds,
                projectIds: selectedProjects,
            },
        });
    }, [leadIds, selectedProjects, leadCopy, projectId]);

    return (
        <Modal
            className={styles.leadCopyModal}
            onCloseButtonClick={onClose}
            heading="Copy leads to projects"
            size="small"
            footerActions={(
                <ConfirmButton
                    name={undefined}
                    title="Export selected sources to selected projects"
                    onConfirm={handleCopyLeadsClick}
                    message={`
                        Are you sure you want to copy
                        ${leadIds?.length.toString()} leads to
                        ${selectedProjects?.length.toString()} projects?
                    `}
                >
                    Export
                </ConfirmButton>
            )}
        >
            <TextOutput
                label="No. of leads to be copied"
                value={leadIds?.length ?? 0}
            />
            <ProjectMultiSelectInput
                name="searchProjects"
                excludedProjects={[projectId]}
                value={selectedProjects}
                className={styles.searchInput}
                onChange={setSelectedProjects}
                options={projectOptions}
                onOptionsChange={setProjectOptions}
                selectionListShown
            />
        </Modal>
    );
}
export default LeadCopyModal;
