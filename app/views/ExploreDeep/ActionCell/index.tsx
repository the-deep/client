import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    ConfirmButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    projectId: string;
    disabled?: boolean;
    memberStatus: 'member' | 'non-member' | 'pending',
}

function ActionCell(props: Props) {
    const {
        className,
        projectId,
        disabled,
        memberStatus,
    } = props;

    const handleJoinProjectClick = useCallback(() => {
        console.warn('Joining project', projectId);
    }, [projectId]);

    const handleCancelJoinProjectClick = useCallback(() => {
        console.warn('Canceling project join request', projectId);
    }, [projectId]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            {memberStatus === 'non-member' && (
                <Button
                    name="join"
                    onClick={handleJoinProjectClick}
                    variant="secondary"
                    disabled={disabled}
                    title="Join Project"
                >
                    Join
                </Button>
            )}
            {memberStatus === 'pending' && (
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
        </div>
    );
}

export default ActionCell;
