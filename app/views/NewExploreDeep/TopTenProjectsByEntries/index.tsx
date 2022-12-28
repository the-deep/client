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
    projectTitle: string | undefined;
    entryCount: number | undefined;
    sourceCount: number | undefined;
}

function TableItem(props: TableItemProps) {
    const {
        projectTitle,
        entryCount,
        sourceCount,
    } = props;

    return (
        <div className={styles.tableItem}>
            <div className={styles.projectTitle}>
                {projectTitle}
            </div>
            <div className={styles.count}>
                {`${entryCount ?? 0} entries`}
            </div>
            <div className={styles.count}>
                {`${sourceCount ?? 0} sources`}
            </div>
        </div>
    );
}

export interface TopProjectByEntries {
    projectId: string;
    projectTitle?: string | null | undefined;
    entryCount?: number | null | undefined;
    sourceCount?: number | null | undefined;
}

const keySelector = (item: TopProjectByEntries) => item.projectId;

interface Props {
    className?: string;
    data: TopProjectByEntries[] | null | undefined;
    label: string;
    mode: 'table' | 'chart';
}

function TopTenProjectByEntries(props: Props) {
    const {
        className,
        data,
        label,
        mode,
    } = props;

    const tableItemRendererParams = useCallback((_: string, datum: TopProjectByEntries) => ({
        projectTitle: datum.projectTitle ?? undefined,
        entryCount: datum.entryCount ?? undefined,
        sourceCount: datum.sourceCount ?? undefined,
    }), []);

    if (!data || data.length <= 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(className, styles.topTenProjectByEntries)}
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
                            dataKey="projectTitle"
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
                                dataKey="projectTitle"
                                position="insideLeft"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ContainerCard>
    );
}

export default TopTenProjectByEntries;
