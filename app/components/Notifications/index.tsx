import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ListView,
    Checkbox,
    Tabs,
    Pager,
    Tab,
    TabList,
    Container,
    Kraken,
} from '@the-deep/deep-ui';

import {
    UserNotificationsQuery,
    UserNotificationsQueryVariables,
} from '#generated/types';

import NotificationItem from './NotificationItem';
import { Notification } from './types';

import styles from './styles.css';

/*
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

const notificationGroupKeySelector = (n: Notification) => n.status;
*/
const notificationKeySelector = (n: Notification) => n.id;

const USER_NOTIFICATIONS = gql`
    query UserNotifications(
        $isPending: Boolean,
        $page: Int,
        $status: NotificationStatusEnum,
        $pageSize: Int,
    ) {
        notifications(
            isPending: $isPending,
            page: $page,
            status: $status,
            pageSize: $pageSize,
        ) {
            totalCount
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

const PAGE_SIZE = 25;

interface Props {
    className?: string;
    closeNotification: () => void;
}

function Notifications(props: Props) {
    const {
        className,
        closeNotification,
    } = props;

    const [doneNotificationsHidden, onDoneNotificationsHiddenChange] = useState(true);

    const [activeView, setActiveView] = React.useState<'notifications' | 'requests' | undefined>('notifications');
    const [page, setPage] = useState<number>(1);

    const variables = useMemo(() => ({
        isPending: activeView === 'requests',
        page,
        status: doneNotificationsHidden ? 'UNSEEN' as const : undefined,
        pageSize: PAGE_SIZE,
    }), [activeView, page, doneNotificationsHidden]);

    const {
        previousData,
        data = previousData,
        loading,
        refetch,
    } = useQuery<UserNotificationsQuery, UserNotificationsQueryVariables>(
        USER_NOTIFICATIONS,
        {
            variables,
        },
    );

    const notificationRendererParams = useCallback((key: string, item: Notification) => ({
        notificationId: key,
        closeNotification,
        notification: item,
        onNotificationUpdate: refetch,
    }), [refetch, closeNotification]);

    /*
    const notificationGroupRendererParams = useCallback((key: string) => ({
        title: key === 'UNSEEN' ? 'Pending' : 'Completed',
    }), []);
    */

    const notifications = data?.notifications?.results as Notification[];

    return (
        <Tabs
            value={activeView}
            onChange={setActiveView}
        >
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
                headerActionsContainerClassName={styles.headerActions}
                headerActions={(
                    <Checkbox
                        name={undefined}
                        label="Hide seen notifications"
                        value={doneNotificationsHidden}
                        onChange={onDoneNotificationsHiddenChange}
                    />
                )}
                borderBelowHeader
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={(data?.notifications?.totalCount) ?? 0}
                        maxItemsPerPage={PAGE_SIZE}
                        onActivePageChange={setPage}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <ListView
                    className={styles.notificationList}
                    data={notifications}
                    renderer={NotificationItem}
                    rendererParams={notificationRendererParams}
                    rendererClassName={styles.notificationItem}
                    keySelector={notificationKeySelector}
                    filtered={false}
                    errored={false}
                    pending={loading}
                    emptyIcon={(
                        <Kraken
                            variant="hi"
                        />
                    )}
                    emptyMessage="You're all caught up."
                    messageShown
                    messageIconShown
                    /*
                        grouped
                        groupRendererParams={notificationGroupRendererParams}
                        groupKeySelector={notificationGroupKeySelector}
                        groupRenderer={NotificationGroup}
                    */
                />
            </Container>
        </Tabs>
    );
}

export default Notifications;
