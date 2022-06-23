import React, { useCallback } from 'react';
import {
    Container,
    ListView,
} from '@the-deep/deep-ui';
import {
    useQuery,
    gql,
} from '@apollo/client';

import {
    RecentActivitiesListQuery,
    RecentActivitiesListQueryVariables,
} from '#generated/types';
import _ts from '#ts';

import ActivityItem from './ActivityItem';
import styles from './styles.css';

const RECENT_ACTIVITIES_LIST = gql`
    query RecentActivitiesList {
        recentActivities {
            id
            type
            typeDisplay
            createdAt
            leadId
            entryId
            createdBy {
                id
                displayName
            }
            project {
                id
                title
            }
        }
    }
`;

export type RecentActivityItemType = NonNullable<RecentActivitiesListQuery['recentActivities']>[number];

const keySelector = (d: RecentActivityItemType) => d.id;

function RecentActivities() {
    const {
        previousData,
        data: recentActivitiesResponse = previousData,
        loading: pending,
    } = useQuery<RecentActivitiesListQuery, RecentActivitiesListQueryVariables>(
        RECENT_ACTIVITIES_LIST,
    );

    const activityRendererParams = useCallback((_: string, info: RecentActivityItemType) => ({
        activity: info,
    }), []);

    return (
        <Container
            className={styles.recentActivity}
            heading={_ts('recentActivity', 'recentActivitiesHeading')}
            contentClassName={styles.content}
        >
            <ListView
                className={styles.activities}
                data={recentActivitiesResponse?.recentActivities}
                renderer={ActivityItem}
                keySelector={keySelector}
                rendererParams={activityRendererParams}
                pending={pending}
                filtered={false}
                errored={false}
                emptyMessage="You do not have any recent activities."
                messageIconShown
                messageShown
            />
        </Container>
    );
}

export default RecentActivities;
