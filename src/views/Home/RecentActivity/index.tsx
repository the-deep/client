import React, { useCallback } from 'react';

import Card from '#components/ui/Card';
import Header from '#components/ui/Header';
import ListView from '#rsu/../v2/View/ListView';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
} from '#typings';
import {
    RecentActivity,
} from '#typings/user';
import _ts from '#ts';

import ActivityItem from './ActivityItem';
import styles from './styles.scss';

const keySelector = (d: RecentActivity) => `${d.type}-${d.id}`;

function RecentActivities() {
    const [
        ,
        recentActivitiesResponse,
        ,
        ,
    ] = useRequest<MultiResponse<RecentActivity>>({
        url: 'server://projects/recent-activities/',
        method: 'GET',
        autoTrigger: true,
        shouldPoll: () => 5000,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('recentActivity', 'recentActivitiesFetchFailed'))({ error: errorBody }),
    });

    const activityRendererParams = useCallback((_: number, info: RecentActivity) => ({
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
