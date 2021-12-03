import React, { useCallback } from 'react';
import {
    Container,
    ListView,
} from '@the-deep/deep-ui';

import { useRequest } from '#base/utils/restRequest';
import { MultiResponse } from '#types';
import {
    RecentActivityItem,
} from '#types/user';
import _ts from '#ts';

import ActivityItem from './ActivityItem';
import styles from './styles.css';

const keySelector = (d: RecentActivityItem) => `${d.type}-${d.id}`;

function RecentActivities() {
    const {
        pending,
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
            contentClassName={styles.content}
        >
            <ListView
                className={styles.activities}
                data={recentActivitiesResponse?.results}
                renderer={ActivityItem}
                keySelector={keySelector}
                rendererParams={activityRendererParams}
                pending={pending}
                emptyMessage="You do not have any recent activities."
                messageIconShown
                messageShown
            />
        </Container>
    );
}

export default RecentActivities;
