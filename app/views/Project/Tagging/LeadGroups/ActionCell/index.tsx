import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    useAlert,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';

import {
    LeadGroupDeleteMutation,
    LeadGroupDeleteMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const LEAD_GROUP_DELETE = gql`
    mutation LeadGroupDelete(
        $projectId: ID!,
        $leadGroupId: ID!,
    ) {
        project(id: $projectId) {
            leadGroupDelete(id: $leadGroupId) {
                ok
            }
        }
    }
`;

export interface Props {
    leadGroupId: string;
    projectId?: string;
    className?: string;
    disabled?: boolean;
    onLeadGroupEditClick: (leadGroupToEdit: string) => void;
    onDeleteSuccess: () => void;
}

function ActionCell(props: Props) {
    const {
        className,
        projectId,
        leadGroupId,
        onDeleteSuccess,
        onLeadGroupEditClick,
        disabled,
    } = props;

    const alert = useAlert();

    const [
        deleteLeadGroup,
    ] = useMutation<LeadGroupDeleteMutation, LeadGroupDeleteMutationVariables>(
        LEAD_GROUP_DELETE,
        {
            onCompleted: (result) => {
                if (result?.project?.leadGroupDelete?.ok) {
                    onDeleteSuccess();
                    alert.show(
                        'Successfully deleted leadGroup.',
                        {
                            variant: 'success',
                        },
                    );
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );

    const handleDeleteLeadGroupClick = useCallback(() => {
        if (projectId) {
            deleteLeadGroup({
                variables: {
                    projectId,
                    leadGroupId,
                },
            });
        }
    }, [projectId, leadGroupId, deleteLeadGroup]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionButton
                className={styles.button}
                name={leadGroupId}
                onClick={onLeadGroupEditClick}
                disabled={disabled}
                title="Edit"
            >
                <FiEdit2 />
            </QuickActionButton>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Delete"
                onConfirm={handleDeleteLeadGroupClick}
                message="Are you sure you want to delete this source group?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
