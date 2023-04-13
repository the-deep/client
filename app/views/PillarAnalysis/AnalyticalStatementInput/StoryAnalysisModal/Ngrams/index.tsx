import React, { useMemo, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isDefined } from '@togglecorp/fujs';
import {
    Kraken,
    Message,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LabelList,
    Legend,
} from 'recharts';
import {
    AutomaticNgramsQuery,
    AutomaticNgramsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const AUTOMATIC_NGRAMS = gql`
    query AutomaticNgrams($projectId: ID!, $ngramsId: ID!) {
        project(id: $projectId) {
            analysisAutomaticNgram(id: $ngramsId) {
                id
                status
                unigrams {
                    count
                    word
                }
                bigrams {
                    count
                    word
                }
                trigrams {
                    count
                    word
                }
            }
        }
    }
`;

const chartMargins = {
    top: 0,
    bottom: 0,
    right: 10,
    left: 10,
};

const emptyTickFormatter = () => '';

interface Props {
    projectId: string;
    ngramsId: string | undefined;
}

function Ngrams(props: Props) {
    const {
        projectId,
        ngramsId,
    } = props;

    const {
        data,
        loading,
        error,
        startPolling,
        stopPolling,
    } = useQuery<AutomaticNgramsQuery, AutomaticNgramsQueryVariables>(
        AUTOMATIC_NGRAMS,
        {
            skip: !ngramsId,
            variables: ngramsId ? {
                projectId,
                ngramsId,
            } : undefined,
        },
    );

    useEffect(
        () => {
            const shouldPoll = data?.project?.analysisAutomaticNgram?.status === 'PENDING'
                || data?.project?.analysisAutomaticNgram?.status === 'STARTED';

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
            data?.project?.analysisAutomaticNgram?.status,
            startPolling,
            stopPolling,
        ],
    );

    const nGrams = useMemo(() => (data?.project?.analysisAutomaticNgram ?? {
        unigrams: [],
        bigrams: [],
        trigrams: [],
    }), [data?.project?.analysisAutomaticNgram]);

    const {
        unigrams,
        bigrams,
        trigrams,
    } = nGrams;

    if (data?.project?.analysisAutomaticNgram?.status === 'SEND_FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="The NLP service is not responding at the moment. Please try again after some time."
                    icon={<Kraken variant="sleep" />}
                />
            </div>
        );
    }

    if (isDefined(error) || data?.project?.analysisAutomaticNgram?.status === 'FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="There was an error while generating N-grams from the entries."
                    icon={<Kraken variant="icecream" />}
                />
            </div>
        );
    }

    const pending = loading
        || data?.project?.analysisAutomaticNgram?.status === 'STARTED'
        || data?.project?.analysisAutomaticNgram?.status === 'PENDING';

    if (pending) {
        return (
            <PendingMessage />
        );
    }
    return (
        <div className={styles.ngrams}>
            {(unigrams?.length > 0 || bigrams?.length > 0 || trigrams?.length > 0) ? (
                <div className={styles.chartContainer}>
                    {unigrams.length > 0 && (
                        <ResponsiveContainer className={styles.chart}>
                            <BarChart
                                layout="vertical"
                                data={unigrams}
                                margin={chartMargins}
                            >
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="word"
                                    type="category"
                                    scale="band"
                                    tickFormatter={emptyTickFormatter}
                                />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <Bar
                                    name="Unigrams"
                                    dataKey="count"
                                    barSize={20}
                                    fill="#796ec6"
                                    opacity="0.4"
                                >
                                    <LabelList
                                        dataKey="word"
                                        position="insideLeft"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {bigrams.length > 0 && (
                        <ResponsiveContainer className={styles.chart}>
                            <BarChart
                                layout="vertical"
                                data={bigrams}
                                margin={chartMargins}
                            >
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="word"
                                    type="category"
                                    scale="band"
                                    tickFormatter={emptyTickFormatter}
                                />
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <Bar
                                    name="Bigrams"
                                    dataKey="count"
                                    barSize={20}
                                    fill="#FB8A91"
                                    opacity="0.4"
                                >
                                    <LabelList
                                        dataKey="word"
                                        position="insideLeft"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {trigrams.length > 0 && (
                        <ResponsiveContainer className={styles.chart}>
                            <BarChart
                                layout="vertical"
                                data={trigrams}
                                margin={chartMargins}
                            >
                                <XAxis type="number" />
                                <YAxis
                                    dataKey="word"
                                    tickFormatter={emptyTickFormatter}
                                    type="category"
                                    scale="band"
                                />
                                <Tooltip />
                                <Legend
                                    verticalAlign="top"
                                />
                                <Bar
                                    name="Trigrams"
                                    dataKey="count"
                                    barSize={20}
                                    fill="#4CC1B7"
                                    opacity="0.4"
                                >
                                    <LabelList
                                        dataKey="word"
                                        position="insideLeft"
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            ) : (
                <div className={styles.message}>
                    <Message
                        message="We couldn't generate automatic n-grams from the entries. Please add more entries and try again."
                        icon={(<Kraken variant="crutches" />)}
                    />
                </div>
            )}
        </div>
    );
}

export default Ngrams;
