import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ConfirmButton,
    useAlert,
    ButtonProps,
} from '@the-deep/deep-ui';
import { useMutation, gql } from '@apollo/client';

import { useModalState } from '#hooks/stateManagement';
import {
    CancelJoinProjectMutation,
    CancelJoinProjectMutationVariables,
} from '#generated/types';

import ProjectJoinModal from '#components/general/ProjectJoinModal';

import styles from './styles.css';

export interface Props {
    className?: string;
    projectId: string;
    disabled?: boolean;
    // NOTE: This refers to if a user's join request is yet to be approved
    // or rejected
    membershipPending: boolean;
    isMember: boolean;
    isRejected: boolean;
    onMemberStatusChange: () => void;
    variant?: ButtonProps<string>['variant'];
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
        isRejected,
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
            onCompleted: (response) => {
                if (response.projectJoinRequestDelete?.ok) {
                    alert.show(
                        'Successfully cancelled project join request.',
                        {
                            variant: 'success',
                        },
                    );
                    onMemberStatusChange();
                } else {
                    alert.show(
                        'Failed to cancel project join request.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to cancel join request.',
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

    if (isMember || isRejected) {
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
                    spacing="compact"
                >
                    Join
                </Button>
            ) : (
                <ConfirmButton
                    name={undefined}
                    onConfirm={handleCancelJoinProjectClick}
                    variant="secondary"
                    message="Are you sure you want to cancel your join request?"
                    disabled={disabled}
                    spacing="compact"
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
