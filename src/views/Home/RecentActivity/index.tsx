import React, { useCallback } from 'react';
import {
    Card,
    Header,
} from '@the-deep/deep-ui';

import ListView from '#rsu/../v2/View/ListView';

import useRequest from '#utils/request';
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
    const [
        ,
        recentActivitiesResponse,
        ,
        ,
    ] = useRequest<MultiResponse<RecentActivityItem>>({
        url: 'server://projects/recent-activities/',
        method: 'GET',
        autoTrigger: true,
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
        <div className={styles.recentActivity}>
            <Header
                className={styles.header}
                heading={_ts('recentActivity', 'recentActivitiesHeading')}
            />
            <Card className={styles.contentContainer}>
                <ListView
                    className={styles.activityList}
                    data={recentActivitiesResponse?.results}
                    renderer={ActivityItem}
                    keySelector={keySelector}
                    rendererParams={activityRendererParams}
                />
            </Card>
        </div>
    );
}

export default RecentActivities;
