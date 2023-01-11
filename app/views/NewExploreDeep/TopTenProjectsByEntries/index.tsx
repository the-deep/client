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
            <div className={styles.title}>
                {projectTitle}
            </div>
            <NumberOutput
                className={styles.numberOutput}
                value={entryCount ?? 0}
            />
            <NumberOutput
                className={styles.numberOutput}
                value={sourceCount ?? 0}
            />
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
                            dataKey="projectTitle"
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
                            dataKey="entryCount"
                            barSize={20}
                            fill="var(--dui-color-brand)"
                            opacity={0.2}
                        >
                            <LabelList
                                dataKey="projectTitle"
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
