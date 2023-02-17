import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ContainerCard,
    ListView,
    NumberOutput,
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
import BarLabel from '#components/charts/BarLabel';

import styles from './styles.css';

const chartMargins = {
    top: 20,
    bottom: 20,
    right: 20,
    left: 20,
};

interface TableItemProps {
    title: string | undefined;
    entriesCount: number;
    leadsCount: number;
}

function TableItem(props: TableItemProps) {
    const {
        title,
        entriesCount,
        leadsCount,
    } = props;

    return (
        <div className={styles.tableItem}>
            <div className={styles.title}>
                {title}
            </div>
            <NumberOutput
                className={styles.numberOutput}
                value={entriesCount ?? 0}
            />
            <NumberOutput
                className={styles.numberOutput}
                value={leadsCount ?? 0}
            />
        </div>
    );
}

export interface TopProjectByEntries {
    id: string;
    title?: string | null | undefined;
    entriesCount: number;
    leadsCount: number;
}

const keySelector = (item: TopProjectByEntries) => item.id;

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
        title: datum.title ?? undefined,
        entriesCount: datum.entriesCount,
        leadsCount: datum.leadsCount,
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
            spacing="none"
            headerClassName={styles.header}
            headerActionsContainerClassName={styles.headerActions}
            headerActions={mode === 'table' && (
                <>
                    <div className={styles.tableHeader}>Entries</div>
                    <div className={styles.tableHeader}>Sources</div>
                </>
            )}
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
                            dataKey="title"
                            type="category"
                            scale="band"
                            hide
                        />
                        <Tooltip
                            isAnimationActive={false}
                        />
                        <Legend verticalAlign="top" />
                        <Bar
                            label={false}
                            legendType="none"
                            name="Entries Count"
                            dataKey="entriesCount"
                            barSize={20}
                            fill="var(--dui-color-brand)"
                            opacity={0.2}
                        >
                            <LabelList
                                dataKey="title"
                                position="insideLeft"
                                content={BarLabel}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ContainerCard>
    );
}

export default TopTenProjectByEntries;
