import React, { useCallback } from 'react';

import Card from '#components/ui/Card';
import Header from '#components/ui/Header';
import DisplayPicture from '#components/viewer/DisplayPicture';
import FormattedDate from '#rscv/FormattedDate';
import ListView from '#rsu/../v2/View/ListView';
import useRequest from '#utils/request';
import { MultiResponse } from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

interface RecentActivity {
    id: number;
    createdAt: string;
    project: number;
    projectDisplayName: string;
    createdBy: number;
    type: string;
    createdByDisplayName: string;
}

const keySelector = (d: RecentActivity) => d.id;
const emptyLink = '#';

function ActivityRenderer(props: RecentActivity) {
    const {
        createdByDisplayName,
        projectDisplayName,
        createdAt,
        type,
    } = props;

    return (
        <div className={styles.activityItem}>
            <div className={styles.displayPicture}>
                <DisplayPicture />
            </div>
            <div className={styles.right}>
                <span className={styles.text}>
                    <a
                        className={styles.link}
                        href={emptyLink}
                    >
                        {createdByDisplayName}
                    </a>
                    <span className={styles.actionType}>
                        {type === 'lead'
                            ? _ts('recentActivity', 'leadAdded')
                            : _ts('recentActivity', 'entryCommentAdded')
                        }
                    </span>
                    <a
                        className={styles.link}
                        href={emptyLink}
                    >
                        {projectDisplayName}
                    </a>
                </span>
                <div className={styles.dateContainer}>
                    <FormattedDate
                        className={styles.date}
                        value={createdAt}
                        mode="hh:mm aaa, MMM dd, yyyy"
                    />
                </div>
            </div>
        </div>
    );
}

function RecentActivity() {
    const [
        ,
        recentActivitiesResponse,
        ,
        ,
    ] = useRequest<MultiResponse<RecentActivity>>({
        url: 'server://projects/recent-activities/',
        method: 'GET',
        autoTrigger: true,
        onSuccess: response => console.warn('Recent Activities fetch successfully', response),
    });

    const activityRendererParams = useCallback((_: number, info: RecentActivity) => ({
        id: info.id,
        projectDisplayName: info.projectDisplayName,
        createdAt: info.createdAt,
        createdByDisplayName: info.createdByDisplayName,
        type: info.type,
    }), []);


    return (
        <Card className={styles.recentActivity}>
            <Header
                className={styles.header}
                heading="Recent Activities"
            />
            <div className={styles.contentContainer}>
                <ListView
                    className={styles.activityList}
                    data={recentActivitiesResponse?.results}
                    renderer={ActivityRenderer}
                    keySelector={keySelector}
                    rendererParams={activityRendererParams}
                />
            </div>
        </Card>
    );
}

export default RecentActivity;
