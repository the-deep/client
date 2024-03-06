import React, { useMemo, useCallback } from 'react';
import {
    List,
    ExpandableContainer,
    TabPanel,
    TextOutput,
} from '@the-deep/deep-ui';
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { EntriesAsList, Error, getErrorObject } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import { AssessmentRegistrySectorTypeEnum } from '#generated/types';
import { calcPercent } from '#utils/common';

import { PartialFormType, SummaryIssueType } from '../../formSchema';
import DimensionItem, { Props as DimensionItemProps } from '../DimensionItem';
import { DimensionType } from '..';

import styles from './styles.css';

const NOT_AFFECTED_COLOR = '#9ce5b9';
const AFFECTED_COLOR = '#f2f3b9';
const MODERATELY_COLOR = '#e5a99c';
const SEVERELY_COLOR = '#e08276';
const CRITICALLY_COLOR = '#871e17';

interface Props {
    className?: string;
    name: AssessmentRegistrySectorTypeEnum;
    data: DimensionType[];
    value: PartialFormType;
    setFieldValue: (...entries: EntriesAsList<PartialFormType>) => void;
    dimensionIssueToClientIdMap: Record<string, string>;
    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;

    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    error: Error<PartialFormType>;
    disabled?: boolean;
}

const keySelector = (d: DimensionType) => d.dimension;
function DimensionTabPanel(props: Props) {
    const {
        className,
        name: sector,
        data,
        value,
        setFieldValue, dimensionIssuesOptions,
        setDimensionIssuesOptions,
        dimensionIssueToClientIdMap,
        setDimensionIssueToClientIdMap,
        error: riskError,
        disabled,
    } = props;

    const error = getErrorObject(riskError);
    const dimensionRendererParams = useCallback(
        (_: string, dimensionData: DimensionType): DimensionItemProps => ({
            data: dimensionData,
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        }), [
            value,
            setFieldValue,
            dimensionIssuesOptions,
            setDimensionIssuesOptions,
            dimensionIssueToClientIdMap,
            setDimensionIssueToClientIdMap,
            disabled,
            error,
            sector,
        ],
    );

    const dimensionStats = useMemo(() => (
        value?.summaryDimensionMeta?.find((item) => item.sector === sector)
    ), [value?.summaryDimensionMeta, sector]);

    const pillarStats = value?.summaryPillarMeta;
    const totalAssessed = pillarStats?.totalPeopleAssessed ?? 0;
    const totalNotAffected = totalAssessed - (dimensionStats?.totalPeopleAffected ?? 0);
    const totalInNeed = dimensionStats?.totalInNeed ?? 0;
    const totalModeratelyInNeed = dimensionStats?.totalModerate ?? 0;
    const totalSeverelyInNeed = dimensionStats?.totalSevere ?? 0;
    const totalCriticallyInNeed = dimensionStats?.totalCritical ?? 0;
    const totalAffected = totalAssessed - (totalInNeed + totalNotAffected);

    const barChartData = useMemo(
        () => ([
            {
                key: '1',
                name: 'Not Affected/Not In Need',
                value: totalNotAffected,
                color: NOT_AFFECTED_COLOR,
            },
            {
                key: '2',
                name: 'Affected/Not In Need',
                value: totalAffected,
                color: AFFECTED_COLOR,
            },
            {
                key: '3',
                name: 'Moderately In Need',
                value: totalModeratelyInNeed,
                color: MODERATELY_COLOR,
            },
            {
                key: '4',
                name: 'Severely In Need',
                value: totalSeverelyInNeed,
                color: SEVERELY_COLOR,
            },
            {
                key: '5',
                name: 'Critically In Need',
                value: totalCriticallyInNeed,
                color: CRITICALLY_COLOR,
            },
        ]),
        [
            totalNotAffected,
            totalAffected,
            totalModeratelyInNeed,
            totalSeverelyInNeed,
            totalCriticallyInNeed,
        ],
    );

    const stackChartData = useMemo(
        () => ([
            {
                totalNotAffectedPercentage: Math.round(
                    (calcPercent(totalNotAffected, totalAssessed) ?? 0) * 100,
                ) / 100,
                totalAffectedPercentage: Math.round(
                    (calcPercent(totalAffected, totalAssessed) ?? 0) * 100,
                ) / 100,
                totalModeratelyInNeedPercentage: Math.round(
                    (calcPercent(totalModeratelyInNeed, totalAssessed) ?? 0) * 100,
                ) / 100,
                totalSeverelyInNeedPercentage: Math.round(
                    (calcPercent(totalSeverelyInNeed, totalAssessed) ?? 0) * 100,
                ) / 100,
                totalCriticallyInNeedPercentage: Math.round(
                    (calcPercent(totalCriticallyInNeed, totalAssessed) ?? 0) * 100,
                ) / 100,
            },
        ]),
        [
            totalAssessed,
            totalNotAffected,
            totalAffected,
            totalModeratelyInNeed,
            totalSeverelyInNeed,
            totalCriticallyInNeed,
        ],
    );

    return (
        <TabPanel
            key={sector}
            name={sector}
            className={_cs(
                className,
                styles.dimensionTabPanel,
            )}
        >
            <List
                data={data}
                keySelector={keySelector}
                renderer={DimensionItem}
                rendererParams={dimensionRendererParams}
            />
            <ExpandableContainer
                heading="Key figures"
                headingSize="extraSmall"
                withoutBorder
                contentClassName={styles.summaryContent}
                expansionTriggerArea="arrow"
            >
                <div className={styles.left}>
                    <TextOutput
                        label="Total Population Assessed"
                        valueType="number"
                        value={totalAssessed}
                    />
                    <TextOutput
                        label="Total Not Affected / Not in Need"
                        valueType="number"
                        value={totalNotAffected}
                    />
                    <TextOutput
                        label="Total Affected / Not in Need"
                        valueType="number"
                        value={totalAffected}
                    />
                    <TextOutput
                        label="Total People in Need"
                        valueType="number"
                        value={totalInNeed}
                    />
                    <TextOutput
                        label="Total People Moderately in Need"
                        valueType="number"
                        value={totalModeratelyInNeed}
                    />
                    <TextOutput
                        label="Total People Severely in Need"
                        valueType="number"
                        value={totalSeverelyInNeed}
                    />
                    <TextOutput
                        label="Total People Critically in Need"
                        valueType="number"
                        value={totalCriticallyInNeed}
                    />
                </div>
                <div className={styles.chart}>
                    <div className={styles.stackChart}>
                        <ResponsiveContainer height={70} width="100%">
                            <BarChart
                                layout="vertical"
                                data={stackChartData}
                            >
                                <YAxis hide type="category" dataKey="name" />
                                <XAxis hide type="number" />
                                <Bar
                                    dataKey="totalNotAffectedPercentage"
                                    stackId="a"
                                    fill={NOT_AFFECTED_COLOR}
                                    label
                                />
                                <Bar
                                    dataKey="totalAffectedPercentage"
                                    stackId="a"
                                    fill={AFFECTED_COLOR}
                                    label
                                />
                                <Bar
                                    dataKey="totalModeratelyInNeedPercentage"
                                    stackId="a"
                                    fill={MODERATELY_COLOR}
                                    label
                                />
                                <Bar
                                    dataKey="totalSeverelyInNeedPercentage"
                                    stackId="a"
                                    fill={SEVERELY_COLOR}
                                    label
                                />
                                <Bar
                                    dataKey="totalCriticallyInNeedPercentage"
                                    stackId="a"
                                    fill={CRITICALLY_COLOR}
                                    label
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className={styles.barChart}>
                        <ResponsiveContainer width="100%" height="100%" debounce={300}>
                            <BarChart data={barChartData}>
                                <Bar maxBarSize={60} dataKey="value">
                                    {barChartData?.map((entry) => (
                                        <Cell key={entry.key} fill={entry.color} />
                                    ))}
                                    <LabelList
                                        dataKey="value"
                                        position="top"
                                        fill="black"
                                    />
                                </Bar>
                                <XAxis
                                    dataKey="name"
                                    angle={60}
                                    textAnchor="start"
                                    height={140}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </ExpandableContainer>
        </TabPanel>
    );
}
export default DimensionTabPanel;
