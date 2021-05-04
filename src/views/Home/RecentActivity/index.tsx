import React, { useCallback } from 'react';
import {
    Card,
    Container,
} from '@the-deep/deep-ui';

import List from '#rsu/../v2/View/List';

import { useRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
} from '#typings';
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
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('recentActivity', 'recentActivitiesFetchFailed'))({ error: errorBody }),
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
            sub
            className={styles.recentActivity}
            heading={_ts('recentActivity', 'recentActivitiesHeading')}
        >
            <Card className={styles.content}>
                <List
                    data={recentActivitiesResponse?.results}
                    renderer={ActivityItem}
                    keySelector={keySelector}
                    rendererParams={activityRendererParams}
                />
            </Card>
        </Container>
    );
}

export default RecentActivities;
