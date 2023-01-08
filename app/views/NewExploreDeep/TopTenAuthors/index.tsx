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

import {
    organizationTitleSelector as organizationLabelSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';

import styles from './styles.css';

const chartMargins = {
    top: 0,
    bottom: 0,
    right: 10,
    left: 10,
};

const emptyTickFormatter = () => '';

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
            <div className={styles.projectCount}>
                {`${projectCount ?? 0} projects`}
            </div>
            <div className={styles.sourceCount}>
                {`${sourceCount ?? 0} sources`}
            </div>
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
                            tickFormatter={emptyTickFormatter}
                        />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        <Bar
                            label={false}
                            legendType="none"
                            name="Sources Count"
                            dataKey="sourceCount"
                            barSize={16}
                            fill="var(--dui-color-accent)"
                            opacity="0.4"
                        >
                            <LabelList
                                dataKey="title"
                                position="insideLeft"
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ContainerCard>
    );
}

export default TopTenAuthors;