import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    Tabs,
    PendingMessage,
    Tab,
    TabList,
    Container,
} from '@the-deep/deep-ui';

import {
    UserNotificationsQuery,
    UserNotificationsQueryVariables,
} from '#generated/types';

import NotificationItem from './NotificationItem';
import { Notification } from './types';

import styles from './styles.css';

interface NotificationGroupProps {
    title: string;
    children: React.ReactNode;
}

function NotificationGroup(props: NotificationGroupProps) {
    const {
        title,
        children,
    } = props;

    return (
        <Container
            className={styles.notificationGroup}
            heading={title}
            headingSize="extraSmall"
            borderBelowHeader
            borderBelowHeaderWidth="thin"
        >
            {children}
        </Container>
    );
}

const notificationKeySelector = (n: Notification) => n.id;
const notificationGroupKeySelector = (n: Notification) => n.status;

const USER_NOTIFICATIONS = gql`
    query UserNotifications(
        $isPending: Boolean,
    ) {
        notifications(isPending: $isPending) {
            results {
                id
                notificationType
                notificationTypeDisplay
                data
                project {
                    id
                    title
                }
                status
                timestamp
            }
        }
    }
`;

interface Props {
    className?: string;
}

function Notifications(props: Props) {
    const {
        className,
    } = props;

    const [activeView, setActiveView] = React.useState<'notifications' | 'requests' | undefined>('notifications');

    const variables = useMemo(() => ({
        isPending: activeView === 'requests',
    }), [activeView]);

    const {
        data,
        loading,
    } = useQuery<UserNotificationsQuery, UserNotificationsQueryVariables>(
        USER_NOTIFICATIONS,
        {
            variables,
        },
    );

    const notificationRendererParams = useCallback((key: string, item: Notification) => ({
        notificationId: key,
        notification: item,
    }), []);

    const notificationGroupRendererParams = useCallback((key: string) => ({
        title: key === 'UNSEEN' ? 'Pending' : 'Completed',
    }), []);

    const notifications = data?.notifications?.results as Notification[];

    return (
        <Tabs
            value={activeView}
            onChange={setActiveView}
        >
            {loading && <PendingMessage />}
            <Container
                className={_cs(styles.notifications, className)}
                spacing="none"
                headingSize="extraSmall"
                heading={(
                    <TabList>
                        <Tab
                            name="notifications"
                            transparentBorder
                        >
                            Notifications
                        </Tab>
                        <Tab
                            name="requests"
                            transparentBorder
                        >
                            Requests
                        </Tab>
                    </TabList>
                )}
                borderBelowHeader
            >
                <ListView
                    data={notifications}
                    renderer={NotificationItem}
                    groupKeySelector={notificationGroupKeySelector}
                    groupRenderer={NotificationGroup}
                    groupRendererParams={notificationGroupRendererParams}
                    grouped
                    rendererParams={notificationRendererParams}
                    keySelector={notificationKeySelector}
                />
            </Container>
        </Tabs>
    );
}

export default Notifications;
