import React, { useCallback } from 'react';

import Card from '#components/ui/Card';
import Header from '#components/ui/Header';
import ListView from '#rsu/../v2/View/ListView';
import LoadingAnimation from '#rscv/LoadingAnimation';

import useRequest from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    MultiResponse,
} from '#typings';
import {
    RecentActivity,
} from '#typings/home';
import _ts from '#ts';

import ActivityItem from './ActivityItem';
import styles from './styles.scss';

const keySelector = (d: RecentActivity) => d.id;

function RecentActivities() {
    const [
        recentActivitiesPending,
        recentActivitiesResponse,
        ,
        ,
    ] = useRequest<MultiResponse<RecentActivity>>({
        url: 'server://projects/recent-activities/',
        method: 'GET',
        autoTrigger: true,
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('recentActivity', 'recentActivitiesFetchFailed'))({ error: errorBody }),
    });

    const activityRendererParams = useCallback((_: number, info: RecentActivity) => ({
        activityId: info.id,
        projectDisplayName: info.projectDisplayName,
        createdAt: info.createdAt,
        createdByDisplayName: info.createdByDisplayName,
        type: info.type,
    }), []);


    return (
        <Card className={styles.recentActivity}>
            <Header
                className={styles.header}
                heading={_ts('recentActivity', 'recentActivitiesHeading')}
                actions={recentActivitiesPending && <LoadingAnimation />}
            />
            <div className={styles.contentContainer}>
                <ListView
                    className={styles.activityList}
                    data={recentActivitiesResponse?.results}
                    renderer={ActivityItem}
                    keySelector={keySelector}
                    rendererParams={activityRendererParams}
                />
            </div>
        </Card>
    );
}

export default RecentActivities;
