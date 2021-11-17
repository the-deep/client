import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ConfirmButton,
    useAlert,
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
    // NOTE: This refers to if a user's join request is yet to be approved
    // or rejected
    membershipPending: boolean;
    isMember: boolean;
    onMemberStatusChange: () => void;
    variant: 'general' | 'action' | 'primary' | 'secondary' | 'tertiary' | 'transparent' | undefined;
}

const CANCEL_JOIN_PROJECT = gql`
    mutation CancelJoinProject(
        $projectId: ID!,
    ) {
        projectJoinRequestDelete(projectId: $projectId) {
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
        onMemberStatusChange,
        variant,
    } = props;

    const [
        projectJoinModalShown,
        showJoinModal,
        hideJoinModal,
    ] = useModalState(false);
    const alert = useAlert();

    const [
        cancelJoinProject,
    ] = useMutation<CancelJoinProjectMutation, CancelJoinProjectMutationVariables>(
        CANCEL_JOIN_PROJECT,
        {
            onCompleted: () => {
                alert.show(
                    'Successfully cancelled project join request.',
                    {
                        variant: 'success',
                    },
                );
                onMemberStatusChange();
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleCancelJoinProjectClick = useCallback(() => {
        cancelJoinProject({
            variables: { projectId },
        });
    }, [projectId, cancelJoinProject]);

    if (isMember) {
        return null;
    }

    return (
        <div className={_cs(styles.actionCell, className)}>
            {!membershipPending ? (
                <Button
                    name={undefined}
                    onClick={showJoinModal}
                    variant={variant}
                    disabled={disabled}
                >
                    Join
                </Button>
            ) : (
                <ConfirmButton
                    name={undefined}
                    onConfirm={handleCancelJoinProjectClick}
                    variant="secondary"
                    disabled={disabled}
                >
                    Cancel Join
                </ConfirmButton>
            )}
            {projectJoinModalShown && (
                <ProjectJoinModal
                    projectId={projectId}
                    onModalClose={hideJoinModal}
                    onJoinRequestSuccess={onMemberStatusChange}
                />
            )}
        </div>
    );
}

export default ActionCell;
