import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
    isDefined,
    mapToList,
} from '@togglecorp/fujs';
import {
    TextArea,
    PendingMessage,
    Modal,
    Button,
    ListView,
    Kraken,
    Container,
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

import { useRequest } from '#base/utils/restRequest';
import ExcerptInput from '#components/entry/ExcerptInput';

import {
    PartialAnalyticalStatementType,
} from '../../schema';
import EntryContext, { EntryMin } from '../../context';

import styles from './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const chartMargins = {
    top: 0,
    bottom: 0,
    right: 10,
    left: 10,
};

const emptyTickFormatter = () => '';

interface NgramsResponse {
    ngrams: {
        unigrams: {
            [key in string]: number;
        };
        bigrams: {
            [key in string]: number;
        };
        trigrams: {
            [key in string]: number;
        };
    }
}

const keySelector = (item: EntryMin) => item.id;

interface Props {
    onModalClose: () => void,
    statementId: string;
    mainStatement: string | undefined,
    onStatementChange: (newVal: string | undefined) => void;
    analyticalEntries: PartialAnalyticalStatementType['analyticalEntries']
    onNgramClick: (item: string) => void;
}

function AnalyticalNGramsModal(props: Props) {
    const {
        onModalClose,
        mainStatement,
        onStatementChange,
        statementId,
        analyticalEntries,
        onNgramClick,
    } = props;

    const { entries } = useContext(EntryContext);
    const [tempMainStatement, setTempMainStatement] = useState<string | undefined>(mainStatement);
    const [pristine, setPristine] = useState(true);

    const handleNgramClick = useCallback((item: unknown) => {
        // NOTE: Recharts doesn't have good typing
        const typedItem = item as { name: string } | undefined;
        if (typedItem?.name) {
            onNgramClick(typedItem.name);
            onModalClose();
        }
    }, [onNgramClick, onModalClose]);

    const entriesForNgrams = useMemo(() => (
        analyticalEntries?.map(
            (ae) => (ae.entry ? entries?.[ae.entry] : undefined),
        ).filter(isDefined) ?? []
    ), [entries, analyticalEntries]);

    const entryPayload = useMemo(() => {
        const excerptTexts = entriesForNgrams.map((ae) => ae.excerpt);

        return ({
            entries: excerptTexts.filter(isDefined),
            ngrams: {
                unigrams: true,
                bigrams: true,
                trigrams: true,
            },
            enable_stopwords: true,
            enable_stemming: false,
            enable_case_sensitive: true,
            max_ngrams_items: 10,
        });
    }, [entriesForNgrams]);

    const {
        pending,
        response: ngramsResponse,
    } = useRequest<NgramsResponse>({
        url: 'serverless://ngram-process/',
        method: 'POST',
        body: entryPayload,
        failureHeader: 'Failed to get ngrams',
    });

    const {
        unigrams,
        bigrams,
        trigrams,
    } = useMemo(() => {
        const ngrams = ngramsResponse?.ngrams;
        return ({
            unigrams: mapToList(ngrams?.unigrams, (d, k) => ({ count: d, name: k })) ?? [],
            bigrams: mapToList(ngrams?.bigrams, (d, k) => ({ count: d, name: k })) ?? [],
            trigrams: mapToList(ngrams?.trigrams, (d, k) => ({ count: d, name: k })) ?? [],
        });
    }, [ngramsResponse]);

    const handleCompleteStatement = useCallback(() => {
        onStatementChange(tempMainStatement);
        setPristine(true);
    }, [tempMainStatement, onStatementChange]);

    const handleStatementChange = useCallback((newVal: string | undefined) => {
        setPristine(false);
        setTempMainStatement(newVal);
    }, []);

    const entriesRendererParams = useCallback((_: string, data: EntryMin) => ({
        className: styles.excerpt,
        value: data.excerpt,
        entryType: data.entryType,
        image: data.image,
        imageRaw: undefined,
        leadImageUrl: undefined,
        readOnly: true,
        name: 'excerpt',
        onChange: noop,
    }), []);

    return (
        <Modal
            className={styles.analyticalModal}
            heading="Data Aggregation Column"
            onCloseButtonClick={onModalClose}
            size="cover"
            bodyClassName={styles.modalBody}
        >
            {pending && <PendingMessage />}
            <Container
                className={styles.topContainer}
                footerActions={(
                    <Button
                        name={statementId}
                        disabled={pristine}
                        onClick={handleCompleteStatement}
                    >
                        Complete Statement
                    </Button>
                )}
            >
                <TextArea
                    name="mainStatement"
                    label="Analytical Statement"
                    onChange={handleStatementChange}
                    value={tempMainStatement}
                    rows={5}
                />
            </Container>
            <div className={styles.bottomContainer}>
                <Container
                    className={styles.entriesContainer}
                    heading={`Selected Entries ${analyticalEntries?.length ?? 0}`}
                >
                    <ListView
                        className={styles.list}
                        data={entriesForNgrams}
                        keySelector={keySelector}
                        renderer={ExcerptInput}
                        rendererParams={entriesRendererParams}
                        filtered={false}
                        pending={false}
                        // TODO: add pending
                        emptyIcon={(
                            <Kraken
                                variant="skydive"
                            />
                        )}
                        emptyMessage="Entries not found."
                        messageIconShown
                        messageShown
                    />
                </Container>
                <div className={styles.chartContainer}>
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={unigrams}
                            margin={chartMargins}
                        >
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                scale="band"
                                tickFormatter={emptyTickFormatter}
                            />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar
                                name="Unigrams"
                                onClick={handleNgramClick}
                                dataKey="count"
                                barSize={16}
                                fill="#796ec6"
                                opacity="0.4"
                            >
                                <LabelList
                                    dataKey="name"
                                    position="insideLeft"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={bigrams}
                            margin={chartMargins}
                        >
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                scale="band"
                                tickFormatter={emptyTickFormatter}
                            />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar
                                name="Bigrams"
                                onClick={handleNgramClick}
                                dataKey="count"
                                barSize={16}
                                fill="#FB8A91"
                                opacity="0.4"
                            >
                                <LabelList
                                    dataKey="name"
                                    position="insideLeft"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={trigrams}
                            margin={chartMargins}
                        >
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
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
                                onClick={handleNgramClick}
                                dataKey="count"
                                barSize={16}
                                fill="#4CC1B7"
                                opacity="0.4"
                            >
                                <LabelList
                                    dataKey="name"
                                    position="insideLeft"
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Modal>
    );
}

export default AnalyticalNGramsModal;
