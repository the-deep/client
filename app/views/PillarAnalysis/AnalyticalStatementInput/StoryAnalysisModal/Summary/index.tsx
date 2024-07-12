import React from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Kraken,
    Message,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    ApolloError,
} from '@apollo/client';
import {
    AnalyticalInformationSummaryQuery,
} from '#generated/types';

import styles from './styles.css';

interface Props {
    summaryData: AnalyticalInformationSummaryQuery | undefined;
    error: ApolloError | undefined;
}

function Summary(props: Props) {
    const {
        summaryData,
        error,
    } = props;

    if (summaryData?.project?.analysisAutomaticSummary?.status === 'SEND_FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="The NLP service is not responding at the moment. Please try again after some time."
                    icon={(<Kraken variant="sleep" />)}
                />
            </div>
        );
    }

    if (isDefined(error) || summaryData?.project?.analysisAutomaticSummary?.status === 'FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="There was an error while generating summary from the entries."
                    icon={(<Kraken variant="icecream" />)}
                />
            </div>
        );
    }

    const pending = summaryData?.project?.analysisAutomaticSummary?.status === 'STARTED'
        || summaryData?.project?.analysisAutomaticSummary?.status === 'PENDING';

    if (pending) {
        return (
            <PendingMessage />
        );
    }

    return (
        <div className={styles.summary}>
            {(summaryData?.project?.analysisAutomaticSummary?.summary?.length ?? 0) > 0 ? (
                <p className={styles.summaryText}>
                    {summaryData?.project?.analysisAutomaticSummary?.summary}
                </p>
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
