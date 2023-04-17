import React, { useEffect } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    Kraken,
    Message,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    AutomaticSummaryQuery,
    AutomaticSummaryQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const AUTOMATIC_SUMMARY = gql`
query AutomaticSummary($projectId: ID!, $summaryId: ID!) {
    project(id: $projectId) {
        id
        analysisAutomaticSummary(id: $summaryId) {
            id
            status
            summary
        }
    }
}
`;

interface Props {
    projectId: string;
    summaryId: string | undefined;
}

function Summary(props: Props) {
    const {
        projectId,
        summaryId,
    } = props;

    const {
        data,
        loading,
        startPolling,
        stopPolling,
        error,
    } = useQuery<AutomaticSummaryQuery, AutomaticSummaryQueryVariables>(
        AUTOMATIC_SUMMARY,
        {
            skip: !summaryId,
            variables: summaryId ? {
                projectId,
                summaryId,
            } : undefined,
        },
    );

    useEffect(
        () => {
            const shouldPoll = data?.project?.analysisAutomaticSummary?.status === 'PENDING'
                || data?.project?.analysisAutomaticSummary?.status === 'STARTED';

            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
            return (() => {
                stopPolling();
            });
        },
        [
            data?.project?.analysisAutomaticSummary?.status,
            startPolling,
            stopPolling,
        ],
    );

    if (data?.project?.analysisAutomaticSummary?.status === 'SEND_FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="The NLP service is not responding at the moment. Please try again after some time."
                    icon={(<Kraken variant="sleep" />)}
                />
            </div>
        );
    }

    if (isDefined(error) || data?.project?.analysisAutomaticSummary?.status === 'FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="There was an error while generating summary from the entries."
                    icon={(<Kraken variant="icecream" />)}
                />
            </div>
        );
    }

    const pending = loading
        || data?.project?.analysisAutomaticSummary?.status === 'STARTED'
        || data?.project?.analysisAutomaticSummary?.status === 'PENDING';

    if (pending) {
        return (
            <PendingMessage />
        );
    }

    return (
        <div className={styles.summary}>
            {(data?.project?.analysisAutomaticSummary?.summary?.length ?? 0) > 0 ? (
                data?.project?.analysisAutomaticSummary?.summary
            ) : (
                <div className={styles.message}>
                    <Message
                        message="We couldn't generate automatic summary from the entries. Please add more entries and try again."
                        icon={(<Kraken variant="crutches" />)}
                    />
                </div>
            )}
        </div>
    );
}

export default Summary;
