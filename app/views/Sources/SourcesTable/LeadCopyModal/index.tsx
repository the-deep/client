import React, { useState, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
    Modal,
    TextOutput,
    PendingMessage,
    ConfirmButton,
    useAlert,
} from '@the-deep/deep-ui';

import ProjectMultiSelectInput, { BasicProject } from '#components/selections/ProjectMultiSelectInput';
import {
    LeadCopyMutation,
    LeadCopyMutationVariables,
} from '#generated/types';

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
        {
            loading,
        },
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
                        'Failed to move sources to desired projects.',
                        {
                            variant: 'error',
                        },
                    );
                } else {
                    alert.show(
                        `Successfully copied desired sources to ${selectedProjects.length.toString()} projects.`,
                        {
                            variant: 'success',
                        },
                    );
                    onClose();
                }
            },
            onError: () => {
                alert.show(
                    'Failed to move sources to desired projects.',
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
            heading="Copy sources to projects"
            size="small"
            footerActions={(
                <ConfirmButton
                    name={undefined}
                    title="Export selected sources to selected project(s)"
                    onConfirm={handleCopyLeadsClick}
                    message={`
                        Are you sure you want to copy
                        ${leadIds?.length.toString()} source(s) to
                        ${selectedProjects?.length.toString()} project(s)?
                    `}
                >
                    Export
                </ConfirmButton>
            )}
        >
            {loading && <PendingMessage />}
            <TextOutput
                label="No. of sources to be copied"
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
                permissionAccess="CREATE_LEAD"
                myProjectsShown
            />
        </Modal>
    );
}
export default LeadCopyModal;
