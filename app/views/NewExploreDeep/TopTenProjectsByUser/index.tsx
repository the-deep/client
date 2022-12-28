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
    userCount: number | undefined;
}

function TableItem(props: TableItemProps) {
    const {
        projectTitle,
        userCount,
    } = props;

    return (
        <div className={styles.tableItem}>
            <div className={styles.projectTitle}>
                {projectTitle}
            </div>
            <div className={styles.projectCount}>
                {`${userCount ?? 0} users`}
            </div>
        </div>
    );
}

export interface TopProjectByUser {
    projectId: string;
    projectTitle?: string | null | undefined;
    userCount?: number | null | undefined;
}

const keySelector = (item: TopProjectByUser) => item.projectId;

interface Props {
    className?: string;
    data: TopProjectByUser[] | null | undefined;
    label: string;
    mode: 'table' | 'chart';
}

function TopTenProjectByUsers(props: Props) {
    const {
        className,
        data,
        label,
        mode,
    } = props;

    const tableItemRendererParams = useCallback((_: string, datum: TopProjectByUser) => ({
        projectTitle: datum.projectTitle ?? undefined,
        userCount: datum.userCount ?? undefined,
    }), []);

    if (!data || data.length <= 0) {
        return null;
    }

    return (
        <ContainerCard
            className={_cs(className, styles.topTenProjectByUsers)}
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
                            name="Users Count"
                            dataKey="userCount"
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

export default TopTenProjectByUsers;
