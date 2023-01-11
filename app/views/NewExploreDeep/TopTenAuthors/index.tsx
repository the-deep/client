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

import {
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';
import BarLabel from '#components/charts/BarLabel';

import styles from './styles.css';

const chartMargins = {
    top: 20,
    bottom: 20,
    right: 20,
    left: 20,
};

interface TableItemProps {
    title: string;
    projectCount: number | undefined;
    sourceCount: number | undefined;
}

function TableItem(props: TableItemProps) {
    const {
        title,
        projectCount,
        sourceCount,
    } = props;

    return (
        <div className={styles.tableItem}>
            <div className={styles.title}>
                {title}
            </div>
            <NumberOutput
                className={styles.numberOutput}
                value={projectCount ?? 0}
            />
            <NumberOutput
                className={styles.numberOutput}
                value={sourceCount ?? 0}
            />
        </div>
    );
}

export interface TopAuthor {
    id: string;
    mergedAs?: {
        id: string;
        title: string;
    } | undefined | null;
    title: string;
    projectCount?: number | null | undefined;
    sourceCount?: number | null | undefined;
}

const keySelector = (item: TopAuthor) => item.id;

interface Props {
    className?: string;
    data: TopAuthor[] | null | undefined;
    label: string;
    mode: 'table' | 'chart';
}

function TopTenAuthors(props: Props) {
    const {
        className,
        data,
        label,
        mode,
    } = props;

    const tableItemRendererParams = useCallback((_: string, datum: TopAuthor) => ({
        title: organizationLabelSelector(datum),
        projectCount: datum.projectCount ?? undefined,
        sourceCount: datum.sourceCount ?? undefined,
    }), []);

    if (!data || data.length <= 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(className, styles.topTenAuthors)}
            heading={label}
            borderBelowHeaderWidth="thin"
            headingSize="extraSmall"
            spacing="none"
            headerClassName={styles.header}
            headerActionsContainerClassName={styles.headerActions}
            headerActions={mode === 'table' && (
                <>
                    <div className={styles.tableHeader}>Entries</div>
                    <div className={styles.tableHeader}>Projects</div>
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
                            isAnimationActive={false}
                            legendType="none"
                            name="Sources Count"
                            dataKey="sourceCount"
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

export default TopTenAuthors;
