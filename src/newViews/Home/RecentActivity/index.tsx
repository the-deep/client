import React, { useCallback } from 'react';
import {
    Card,
    Container,
    List,
} from '@the-deep/deep-ui';
import { GiShrug } from 'react-icons/gi';

import { useRequest } from '#utils/request';
import { MultiResponse } from '#typings';
import {
    RecentActivityItem,
} from '#typings/user';
import _ts from '#ts';

import ActivityItem from './ActivityItem';
import styles from './styles.scss';

const keySelector = (d: RecentActivityItem) => `${d.type}-${d.id}`;

function RecentActivities() {
    const {
        response: recentActivitiesResponse,
    } = useRequest<MultiResponse<RecentActivityItem>>({
        url: 'server://projects/recent-activities/',
        method: 'GET',
        failureHeader: _ts('recentActivity', 'recentActivitiesFetchFailed'),
    });

    const activityRendererParams = useCallback((_: string, info: RecentActivityItem) => ({
        activityId: keySelector(info),
        projectDisplayName: info.projectDisplayName,
        createdAt: info.createdAt,
        createdByDisplayName: info.createdByDisplayName,
        createdByDisplayPicture: info.createdByDisplayPicture,
        type: info.type,
    }), []);


    return (
        <Container
            className={styles.recentActivity}
            heading={_ts('recentActivity', 'recentActivitiesHeading')}
        >
            <Card className={styles.content}>
                {(recentActivitiesResponse?.results ?? []).length > 0 ? (
                    <List
                        data={recentActivitiesResponse?.results}
                        renderer={ActivityItem}
                        keySelector={keySelector}
                        rendererParams={activityRendererParams}
                    />
                ) : (
                    <div className={styles.emptyMessage}>
                        <GiShrug className={styles.icon} />
                        <div className={styles.text}>
                            {/* FIXME: use strings with appropriate wording */}
                            You do not have any recent activities
                        </div>
                    </div>
                )}
            </Card>
        </Container>
    );
}

export default RecentActivities;
