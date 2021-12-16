import React, { useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    IoChevronDown,
    IoChevronUp,
    IoCheckmark,
    IoArrowUndoSharp,
} from 'react-icons/io5';
import {
    Button,
    QuickActionButton,
    PendingMessage,
    useAlert,
    Container,
    DateOutput,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';
import { useModalState } from '#hooks/stateManagement';

import {
    NotificationStatusUpdateMutation,
    NotificationStatusUpdateMutationVariables,
} from '#generated/types';

import { Notification } from '../types';
import styles from './styles.css';

const NOTIFICATION_STATUS_UPDATE = gql`
mutation NotificationStatusUpdate($notificationId: ID!, $newStatus: NotificationStatusEnum!) {
    notificationStatusUpdate(data: { id: $notificationId, status: $newStatus }) {
        ok
        result {
            id
            notificationType
            notificationTypeDisplay
            data
            project {
                id
                title
            }
            status
            statusDisplay
            timestamp
        }
    }
}
`;

interface Props {
    className?: string;
    content?: React.ReactNode;
    userName: string;
    notification: Omit<Notification, 'notificationType'>;
    description?: string;
    descriptionLabel?: string;
    actions?: React.ReactNode;
    pendingRequests?: boolean;
}

function NotificationContainer(props: Props) {
    const {
        content,
        className,
        userName,
        notification: {
            id: notificationId,
            timestamp,
            status,
        },
        description,
        actions,
        pendingRequests = false,
        descriptionLabel,
    } = props;

    const [
        isDescriptionShown,,,,
        toggleDescriptionVisibility,
    ] = useModalState(false);

    const alert = useAlert();

    const [
        updateStatus,
        { loading },
    ] = useMutation<NotificationStatusUpdateMutation, NotificationStatusUpdateMutationVariables>(
        NOTIFICATION_STATUS_UPDATE,
        {
            refetchQueries: ['UserNotificationsCount'],
            onCompleted: (response) => {
                if (response?.notificationStatusUpdate?.ok) {
                    const newStatus = response.notificationStatusUpdate?.result?.statusDisplay;
                    alert.show(
                        `Successfully updated notification status as ${newStatus?.toLowerCase() ?? 'required'}.`,
                        {
                            variant: 'success',
                        },
                    );
                } else {
                    alert.show(
                        'Failed to update notification status.',
                        {
                            variant: 'error',
                        },
                    );
                }
            },

            onError: () => {
                alert.show(
                    'Failed to update notification status.',
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleUnseenClick = useCallback(() => {
        updateStatus({
            variables: {
                notificationId,
                newStatus: 'UNSEEN',
            },
        });
    }, [updateStatus, notificationId]);

    const handleSeenClick = useCallback(() => {
        updateStatus({
            variables: {
                notificationId,
                newStatus: 'SEEN',
            },
        });
    }, [updateStatus, notificationId]);

    return (
        <Container
            className={_cs(
                className,
                styles.notificationContainer,
                status === 'SEEN' && styles.seenNotification,
            )}
            contentClassName={styles.content}
            footerActions={actions}
        >
            {(loading || pendingRequests) && (<PendingMessage />)}
            <Avatar
                className={styles.displayPicture}
                // NOTE: We'll add user profiles later after we fix it from server side
                src={undefined}
                name={userName}
            />
            <div className={styles.midContainer}>
                <div className={styles.mainText}>
                    {content}
                </div>
                <div className={styles.dateContainer}>
                    <DateOutput
                        format="dd-MM-yyyy at hh:mm aaa"
                        value={timestamp}
                    />
                    {isDefined(description) && (
                        <Button
                            name={undefined}
                            spacing="compact"
                            variant="transparent"
                            onClick={toggleDescriptionVisibility}
                            icons={isDescriptionShown ? <IoChevronUp /> : <IoChevronDown />}
                        >
                            {descriptionLabel}
                        </Button>
                    )}
                </div>
                {description && isDescriptionShown && (
                    <div className={styles.description}>
                        {description}
                    </div>
                )}
            </div>
            <QuickActionButton
                name={undefined}
                className={styles.button}
                title={status === 'SEEN' ? 'Mark as unseen' : 'Mark as seen'}
                onClick={status === 'SEEN' ? handleUnseenClick : handleSeenClick}
            >
                {status === 'SEEN' ? <IoArrowUndoSharp /> : <IoCheckmark />}
            </QuickActionButton>
        </Container>
    );
}

export default NotificationContainer;
