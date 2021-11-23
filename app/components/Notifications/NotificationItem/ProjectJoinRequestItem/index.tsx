import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    IoClose,
    IoCheckmark,
} from 'react-icons/io5';
import {
    Button,
    useAlert,
} from '@the-deep/deep-ui';

import generateString from '#utils/string';
import {
    JoinRequestAcceptRejectMutation,
    JoinRequestAcceptRejectMutationVariables,
} from '#generated/types';

import {
    BaseNotification,
    ProjectJoinRequest,
} from '../../types';
import NotificationContainer from '../../NotificationContainer';

import styles from './styles.css';

const JOIN_REQUEST_ACCEPT_REJECT = gql`
mutation JoinRequestAcceptReject(
    $projectId: ID!,
    $requestId: ID!,
    $status: ProjectJoinRequestStatusEnum,
) {
    project(id: $projectId) {
        acceptRejectProject(id: $requestId, data: { status: $status }) {
            ok
            errors
        }
    }
}
`;

interface Props {
    className?: string;
    notification: BaseNotification & ProjectJoinRequest;
    onNotificationUpdate: () => void;
}

function ProjectJoinRequestItem(props: Props) {
    const {
        className,
        notification,
        onNotificationUpdate,
    } = props;

    const { data } = notification;
    const alert = useAlert();

    const [
        updateStatus,
    ] = useMutation<JoinRequestAcceptRejectMutation, JoinRequestAcceptRejectMutationVariables>(
        JOIN_REQUEST_ACCEPT_REJECT,
        {
            onCompleted: (response) => {
                if (response?.project?.acceptRejectProject?.ok) {
                    alert.show(
                        'Successfully updated notification status.',
                        {
                            variant: 'success',
                        },
                    );
                    onNotificationUpdate();
                }
            },
        },
    );

    const handleRejectButtonClick = useCallback(() => {
        updateStatus({
            variables: {
                projectId: String(data.project.id),
                requestId: String(data.id),
                status: 'REJECTED',
            },
        });
    }, [
        updateStatus,
        data,
    ]);

    const handleAcceptButtonClick = useCallback(() => {
        updateStatus({
            variables: {
                projectId: String(data.project.id),
                requestId: String(data.id),
                status: 'ACCEPTED',
            },
        });
    }, [
        updateStatus,
        data,
    ]);

    return (
        <NotificationContainer
            className={_cs(className, styles.projectJoinItem)}
            notification={notification}
            userName={data?.requested_by?.display_name}
            descriptionLabel="Reason"
            description={data?.reason}
            content={
                generateString(
                    '{requestorName} requested to join the project {projectTitle}.',
                    {
                        requestorName: (<b>{data?.requested_by?.display_name}</b>),
                        projectTitle: (<b>{data?.project?.title}</b>),
                    },
                )
            }
            actions={data?.status === 'pending' && (
                <>
                    <Button
                        name={undefined}
                        onClick={handleRejectButtonClick}
                        icons={(
                            <IoClose />
                        )}
                        spacing="compact"
                        variant="secondary"
                    >
                        Reject
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleAcceptButtonClick}
                        spacing="compact"
                        icons={(
                            <IoCheckmark />
                        )}
                    >
                        Accept
                    </Button>
                </>
            )}
        />
    );
}

export default ProjectJoinRequestItem;
