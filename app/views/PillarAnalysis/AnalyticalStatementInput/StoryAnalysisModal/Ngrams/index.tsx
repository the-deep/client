import React, { useMemo, useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { isDefined } from '@togglecorp/fujs';
import {
    Kraken,
    Message,
    PendingMessage,
    Tabs,
    Tab,
    TabPanel,
    TabList,
} from '@the-deep/deep-ui';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
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
            id
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

const unigramData = [
    {
        count: 3,
        word: 'and',
    },
    {
        count: 40,
        word: 'here',
    },
    {
        count: 13,
        word: 'know',
    },
];

const bigramData = [
    {
        count: 5,
        word: 'hand',
    },
    {
        count: 30,
        word: 'there',
    },
    {
        count: 19,
        word: 'now',
    },
];

const trigramData = [
    {
        count: 25,
        word: 'data',
    },
    {
        count: 15,
        word: 'drop',
    },
    {
        count: 30,
        word: 'board',
    },
];

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

    const [activeTab, setActiveTab] = useState<string | undefined>('unigram');

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

    // const nGrams = useMemo(() => (data?.project?.analysisAutomaticNgram ?? {
    const nGrams = useMemo(() => ({
        unigrams: unigramData,
        bigrams: bigramData,
        trigrams: trigramData,
    } ?? {
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
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="secondary"
                >
                    <TabList className={styles.tabList}>
                        {unigrams.length > 0 && (
                            <Tab name="unigram">
                                Unigram
                            </Tab>
                        )}
                        {bigrams.length > 0 && (
                            <Tab name="bigram">
                                Bigram
                            </Tab>
                        )}
                        {trigrams.length > 0 && (
                            <Tab name="trigram">
                                Trigram
                            </Tab>
                        )}
                    </TabList>
                    {unigrams.length > 0 && (
                        <TabPanel
                            name="unigram"
                            className={styles.chartContainer}
                        >
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
                                        tickFormatter={emptyTickFormatter}
                                    />
                                    <Legend verticalAlign="top" />
                                    <Bar
                                        name="Unigrams"
                                        dataKey="count"
                                        barSize={20}
                                        fill="#1a3ed0"
                                        opacity="0.4"
                                    >
                                        <LabelList
                                            dataKey="word"
                                            position="insideLeft"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </TabPanel>
                    )}
                    {bigrams.length > 0 && (
                        <TabPanel
                            name="bigram"
                            className={styles.chartContainer}
                        >
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
                                        tickFormatter={emptyTickFormatter}
                                    />
                                    <Legend verticalAlign="top" />
                                    <Bar
                                        name="Bigrams"
                                        dataKey="count"
                                        barSize={20}
                                        fill="#1a3ed0"
                                        opacity="0.4"
                                    >
                                        <LabelList
                                            dataKey="word"
                                            position="insideLeft"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </TabPanel>
                    )}
                    {trigrams.length > 0 && (
                        <TabPanel
                            name="trigram"
                            className={styles.chartContainer}
                        >
                            <ResponsiveContainer className={styles.chart}>
                                <BarChart
                                    data={trigrams}
                                    layout="vertical"
                                    margin={chartMargins}
                                >
                                    <XAxis dataKey="count" type="number" />
                                    <YAxis
                                        dataKey="word"
                                        tickFormatter={emptyTickFormatter}
                                        type="category"
                                    />
                                    <Legend
                                        verticalAlign="top"
                                    />
                                    <Bar
                                        name="trigrams"
                                        dataKey="count"
                                        barSize={20}
                                        fill="#1a3ed0"
                                        opacity="0.4"
                                    >
                                        <LabelList
                                            dataKey="word"
                                            position="insideLeft"
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </TabPanel>
                    )}
                </Tabs>
            ) : (
                <div className={styles.message}>
                    <Message
                        message="We couldn't generate automatic n-grams
                        from the entries. Please add more entries and try again."
                        icon={(<Kraken variant="crutches" />)}
                    />
                </div>
            )}
        </div>
    );
}

export default Ngrams;
