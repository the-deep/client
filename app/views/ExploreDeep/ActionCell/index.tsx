import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ConfirmButton,
} from '@the-deep/deep-ui';
import { useMutation, gql } from '@apollo/client';

import { useModalState } from '#hooks/stateManagement';
import {
    CancelJoinProjectMutation,
    CancelJoinProjectMutationVariables,
} from '#generated/types';

import ProjectJoinModal from './ProjectJoinModal';

import styles from './styles.css';

export interface Props {
    className?: string;
    projectId: string;
    disabled?: boolean;
    membershipPending: boolean;
    isMember: boolean;
}

const CANCEL_JOIN_PROJECT = gql`
    mutation CancelJoinProject(
        $projectId: ID!,
    ) {
        deleteProjectJoin(id: $projectId) {
            ok,
        }
    }
`;

function ActionCell(props: Props) {
    const {
        className,
        projectId,
        disabled,
        membershipPending,
        isMember,
    } = props;

    const [
        projectJoinModalShown,
        showJoinModal,
        hideJoinModal,
    ] = useModalState(false);

    const [
        cancelJoinProject,
    ] = useMutation<CancelJoinProjectMutation, CancelJoinProjectMutationVariables>(
        CANCEL_JOIN_PROJECT,
        {
            onCompleted: () => {
                console.warn('Join Request successfully sent');
            },
            onError: () => {
                console.warn('Failed to send request');
            },
        },
    );

    const handleCancelJoinProjectClick = useCallback(() => {
        cancelJoinProject({
            variables: { projectId },
        });
    }, [projectId]);

    if (isMember) {
        return null;
    }

    return (
        <div className={_cs(styles.actionCell, className)}>
            {!membershipPending ? (
                <Button
                    name="join"
                    onClick={showJoinModal}
                    variant="secondary"
                    disabled={disabled}
                    title="Join Project"
                >
                    Join
                </Button>
            ) : (
                <ConfirmButton
                    name="cancel-join"
                    onConfirm={handleCancelJoinProjectClick}
                    variant="secondary"
                    disabled={disabled}
                    title="Cancel Join Request"
                >
                    Cancel Join
                </ConfirmButton>
            )}
            {projectJoinModalShown && (
                <ProjectJoinModal
                    projectId={projectId}
                    onModalClose={hideJoinModal}
                />
            )}
        </div>
    );
}

export default ActionCell;
