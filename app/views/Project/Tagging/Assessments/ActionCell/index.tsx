import React, { useCallback, useMemo } from 'react';
import {
    generatePath,
} from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoTrashBinOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import {
    useAlert,
    QuickActionLink,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';
import routes from '#base/configs/routes';

import {
    AssessmentDeleteMutation,
    AssessmentDeleteMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const ASSESSMENT_DELETE = gql`
    mutation AssessmentDelete(
        $projectId: ID!,
        $assessmentId: ID!,
    ) {
        project(id: $projectId) {
            assessmentDelete(id: $assessmentId) {
                ok
            }
        }
    }
`;

export interface Props {
    assessmentId: string;
    projectId?: string;
    leadId?: string;
    className?: string;
    disabled?: boolean;
    onDeleteSuccess: () => void;
}

function ActionCell(props: Props) {
    const {
        className,
        projectId,
        leadId,
        assessmentId,
        onDeleteSuccess,
        disabled,
    } = props;

    const alert = useAlert();

    const [
        deleteAssessment,
    ] = useMutation<AssessmentDeleteMutation, AssessmentDeleteMutationVariables>(
        ASSESSMENT_DELETE,
        {
            onCompleted: (result) => {
                if (result?.project?.assessmentDelete?.ok) {
                    onDeleteSuccess();
                    alert.show(
                        'Successfully deleted assessment.',
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

    const handleDeleteAssessmentClick = useCallback(() => {
        if (projectId) {
            deleteAssessment({
                variables: {
                    projectId,
                    assessmentId,
                },
            });
        }
    }, [deleteAssessment, projectId, assessmentId]);

    const assessmentEditLink = useMemo(() => ({
        pathname: generatePath(
            routes.assessmentEdit.path,
            {
                projectId,
                leadId,
            },
        ),
    }), [projectId, leadId]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionLink
                className={styles.button}
                // TODO: Link this to actual assessment edit page
                to={assessmentEditLink}
                disabled={disabled}
                title="Edit"
            >
                <FiEdit2 />
            </QuickActionLink>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title="Delete"
                onConfirm={handleDeleteAssessmentClick}
                message="Are you sure you want to delete this assessment?"
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrashBinOutline />
            </QuickActionConfirmButton>
        </div>
    );
}

export default ActionCell;
