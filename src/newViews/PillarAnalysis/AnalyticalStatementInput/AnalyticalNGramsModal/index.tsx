import React, { useContext } from 'react';
import {
    TextArea,
    Modal,
    Button,
    ListView,
    Header,
} from '@the-deep/deep-ui';
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
// import ExcerptOutput from '#newComponents/viewer/ExcerptOutput';
import EntriesItem from '#components/other/EntriesItem';
import { useRequest } from '#utils/request';

import {
    PartialAnalyticalStatementType,
} from '../../schema';
import EntryContext from '../../context';
import styles from './styles.scss';

interface PostNgrams {
    key: number;
    value: string;
}

interface ExcerptTest {
    droppedExcerpt?: string;
    entryType?: string;
    excerpt?: string | undefined;
    id: number;
}

interface Props {
    onModalClose: () => void,
    mainStatement: string | undefined,
    analyticalEntries: PartialAnalyticalStatementType['analyticalEntries']
}

function AnalyticalNGramsModal(props: Props) {
    const {
        onModalClose,
        mainStatement,
        analyticalEntries,
    } = props;

    const { entries } = useContext(EntryContext);

    const excerptList: ExcerptTest[] = [];

    if (entries) {
        Object.values(entries).forEach(
            value => excerptList.push(value.excerpt),
        );
    }
    console.log('check ExcerptList::>>', excerptList);

    const entryPayload = {
        entries: excerptList,
        ngrams: {
            unigrams: true,
            bigrams: true,
            trigrams: true,
        },
        enable_stopwords: true,
        enable_stemming: false,
        enable_case_sensitive: true,
        max_ngrams_items: 10,
    };

    const keySelector = (item: ExcerptTest) => item.id;

    console.log('check entries:>>', analyticalEntries);
    console.log('From EntryContext::>>', entries);

    const {
        pending: statementPending,
    } = useRequest<PostNgrams>({
        url: 'serverless://ngram-process/',
        method: 'POST',
        body: entryPayload,
        onSuccess: (response) => {
            console.log('Response of Analytical statement::>>', response);
        },
        failureHeader: 'Failed response of STATEMENT !!',
    });
    console.log('Checking POST response::>>', statementPending);

    const chartData = [
        {
            name: 'Word A',
            uv: 590,
            pv: 800,
            amt: 1400,
        },
        {
            name: 'Word B',
            uv: 868,
            pv: 967,
            amt: 1506,
        },
        {
            name: 'Word C',
            uv: 1397,
            pv: 1098,
            amt: 989,
        },
        {
            name: 'Word D',
            uv: 1480,
            pv: 1200,
            amt: 1228,
        },
    ];

    const handleCompleteStatement = () => {
        console.log('handled complete statement ######');
    };

    const entriesRendererParams = (_: number, data: ExcerptTest) => ({
        excerpt: data.excerpt,
        entryType: data.entryType,
    });

    return (
        <>
            <Modal
                className={styles.analyticalModal}
                heading="Data Aggregation Column"
                onCloseButtonClick={onModalClose}
            >
                <div className={styles.analyticalContainer}>
                    <form
                        className={styles.statementContainer}
                        onSubmit={handleCompleteStatement}
                    >
                        <TextArea
                            className={styles.statementArea}
                            label="Analytical Statement"
                            labelContainerClassName={styles.analyticalLabel}
                            name="mainStatement"
                            // onChange={setFieldValue}
                            value={mainStatement}
                            // error={error?.mainStatement}
                            rows={5}
                        />
                        <Button
                            className={styles.completeButton}
                            name="default"
                            type="submit"
                        >
                            Complete Statement
                        </Button>
                    </form>
                </div>
                <div className={styles.detailsContainer}>
                    <div className={styles.entriesContainer}>
                        <div className={styles.entriesHeader}>
                            <Header
                                description="Selected Entries"
                            />
                        </div>
                        <ListView
                            data={analyticalEntries}
                            keySelector={keySelector}
                            renderer={EntriesItem}
                            rendererParams={entriesRendererParams}
                        />

                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                layout="vertical"
                                width={400}
                                height={300}
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" scale="band" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pv" barSize={15} fill="#8181e6" />
                            </ComposedChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                layout="vertical"
                                width={400}
                                height={300}
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" scale="band" />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pv" barSize={15} fill="#8181e6" />
                            </ComposedChart>
                        </ResponsiveContainer>

                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                layout="vertical"
                                width={400}
                                height={300}
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
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
                                <Bar dataKey="pv" barSize={15} fill="#8181e6" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default AnalyticalNGramsModal;
