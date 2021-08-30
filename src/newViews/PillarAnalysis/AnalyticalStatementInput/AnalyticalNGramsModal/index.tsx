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
    Container,
} from '@the-deep/deep-ui';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

import { useRequest } from '#utils/request';
import ExcerptOutput from '#newComponents/viewer/ExcerptOutput';

import {
    PartialAnalyticalStatementType,
} from '../../schema';
import EntryContext, { EntryFieldsMin } from '../../context';

import styles from './styles.scss';

const chartMargins = {
    top: 0,
    bottom: 0,
    right: 10,
    left: 10,
};

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

const keySelector = (item: EntryFieldsMin) => item.id;

interface Props {
    onModalClose: () => void,
    statementId: string;
    mainStatement: string | undefined,
    onStatementChange: (newVal: string | undefined) => void;
    analyticalEntries: PartialAnalyticalStatementType['analyticalEntries']
}

function AnalyticalNGramsModal(props: Props) {
    const {
        onModalClose,
        mainStatement,
        onStatementChange,
        statementId,
        analyticalEntries,
    } = props;

    const { entries } = useContext(EntryContext);
    const [tempMainStatement, setTempMainStatement] = useState<string | undefined>(mainStatement);
    const [pristine, setPristine] = useState(true);

    const entriesForNgrams = useMemo(() => (
        analyticalEntries?.map(
            ae => (ae.entry ? entries?.[ae.entry] : undefined),
        ).filter(isDefined) ?? []
    ), [entries, analyticalEntries]);

    const entryPayload = useMemo(() => {
        const excerptTexts = entriesForNgrams.map(ae => ae.excerpt);

        return ({
            entries: excerptTexts.filter(ae => ae && ae.length > 3).filter(isDefined),
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
        onSuccess: (response) => {
            console.log('Response of Analytical statement::>>', response);
        },
        failureHeader: 'Failed response of STATEMENT !!',
    });

    const {
        unigrams,
        bigrams,
        trigrams,
    } = useMemo(() => {
        const ngrams = ngramsResponse?.ngrams;
        return ({
            unigrams: mapToList(ngrams?.unigrams ?? {}, (d, k) => ({ count: d, name: k })),
            bigrams: mapToList(ngrams?.bigrams ?? {}, (d, k) => ({ count: d, name: k })),
            trigrams: mapToList(ngrams?.trigrams ?? {}, (d, k) => ({ count: d, name: k })),
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

    const entriesRendererParams = useCallback((_: number, data: EntryFieldsMin) => ({
        className: styles.excerpt,
        excerpt: data.excerpt,
        imageDetails: data.imageDetails,
        tabularFieldData: data.tabularFieldData,
        entryType: data.entryType,
    }), []);

    return (
        <Modal
            className={styles.analyticalModal}
            heading="Data Aggregation Column"
            onCloseButtonClick={onModalClose}
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
                    sub
                >
                    <ListView
                        className={styles.list}
                        data={entriesForNgrams}
                        keySelector={keySelector}
                        renderer={ExcerptOutput}
                        rendererParams={entriesRendererParams}
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
                            <YAxis dataKey="name" type="category" scale="band" />
                            <Tooltip />
                            <Legend />
                            <Bar
                                name="Unigrams"
                                dataKey="count"
                                barSize={15}
                                fill="#796ec6"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer>
                        <BarChart
                            layout="vertical"
                            data={bigrams}
                            margin={chartMargins}
                        >
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" scale="band" />
                            <Tooltip />
                            <Legend />
                            <Bar
                                name="Bigrams"
                                dataKey="count"
                                barSize={15}
                                fill="#fb8a91"
                            />
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
                                type="category"
                                scale="band"
                                label={
                                    <Button
                                        variant="transparent"
                                        name="transparent"
                                    >
                                        country
                                    </Button>
                                }
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                name="Trigrams"
                                dataKey="count"
                                barSize={15}
                                fill="#4cc1b7"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Modal>
    );
}

export default AnalyticalNGramsModal;
