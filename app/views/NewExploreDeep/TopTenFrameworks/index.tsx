import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    ListView,
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

import styles from './styles.css';

const chartMargins = {
    top: 0,
    bottom: 0,
    right: 10,
    left: 10,
};

const emptyTickFormatter = () => '';

interface TableItemProps {
    analysisFrameworkTitle: string | undefined;
    entryCount: number | undefined;
    projectCount: number | undefined;
}

function TableItem(props: TableItemProps) {
    const {
        analysisFrameworkTitle,
        entryCount,
        projectCount,
    } = props;

    return (
        <div className={styles.tableItem}>
            <div className={styles.frameworkTitle}>
                {analysisFrameworkTitle}
            </div>
            <div className={styles.count}>
                {`${entryCount ?? 0} entries`}
            </div>
            <div className={styles.count}>
                {`${projectCount ?? 0} sources`}
            </div>
        </div>
    );
}

export interface TopFrameworks {
    analysisFrameworkId: string;
    analysisFrameworkTitle?: string | null | undefined;
    entryCount?: number | null | undefined;
    projectCount?: number | null | undefined;
}

const keySelector = (item: TopFrameworks) => item.analysisFrameworkId;

interface Props {
    className?: string;
    data: TopFrameworks[] | null | undefined;
    label: string;
    mode: 'table' | 'chart';
}

function TopTenFrameworks(props: Props) {
    const {
        className,
        data,
        label,
        mode,
    } = props;

    const tableItemRendererParams = useCallback((_: string, datum: TopFrameworks) => ({
        analysisFrameworkTitle: datum.analysisFrameworkTitle ?? undefined,
        entryCount: datum.entryCount ?? undefined,
        projectCount: datum.projectCount ?? undefined,
    }), []);

    if (!data || data.length <= 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(className, styles.topTenFrameworks)}
            heading={label}
            borderBelowHeaderWidth="thin"
            headingSize="extraSmall"
            borderBelowHeader
        >
            {mode === 'table' && (
                <ListView
                    className={styles.table}
                    data={data}
                    keySelector={keySelector}
                    renderer={TableItem}
                    rendererParams={tableItemRendererParams}
                    pending={false}
                    filtered={false}
                    errored={false}
                />
            )}
            {mode === 'chart' && (
                <ResponsiveContainer
                    className={styles.chart}
                >
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={chartMargins}
                    >
                        <XAxis type="number" />
                        <YAxis
                            dataKey="analysisFrameworkTitle"
                            type="category"
                            scale="band"
                            tickFormatter={emptyTickFormatter}
                        />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        <Bar
                            label={false}
                            legendType="none"
                            name="Entries Count"
                            dataKey="entryCount"
                            barSize={16}
                            fill="var(--dui-color-accent)"
                            opacity="0.4"
                        >
                            <LabelList
                                dataKey="analysisFrameworkTitle"
                                position="insideLeft"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ContainerCard>
    );
}

export default TopTenFrameworks;
