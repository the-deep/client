import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    CategoricalBarChart,
    // NumericBarChart,
    TemporalBarChart,
} from '@the-deep/reporting-module-components';

import {
    type BarChartConfigType,
} from '../../../../schema';
import {
    resolveTextStyle,
    resolveLineStyle,
} from '../../../../utils';

import styles from './styles.css';

type Datum = Record<string, string | number | undefined>;

interface Props {
    configuration?: BarChartConfigType;
    cacheData: Datum[] | undefined;
}

function BarContent(props: Props) {
    const {
        configuration,
        cacheData,
    } = props;

    const config = useMemo(() => {
        if (!cacheData || !configuration) {
            return undefined;
        }

        const {
            verticalAxis,
            title,
            style,
            subTitle,
            verticalAxisExtendMinimumValue,
            verticalAxisExtendMaximumValue,
            verticalAxisTitle,
            horizontalAxisTitle,
            horizontalAxisLineVisible,
            horizontalGridLineVisible,
            verticalAxisLineVisible,
            verticalGridLineVisible,
        } = configuration;

        const yKeys = verticalAxis?.map((item) => item.label).filter(isDefined);
        const yValueSelector = (axis: Datum) => (
            verticalAxis?.map((item) => {
                const safeNumber = Number((item.label ? axis[item.label] : undefined));

                return ({
                    key: item.label ?? '',
                    value: !Number.isNaN(safeNumber) ? safeNumber : 0,
                });
            })
        ) ?? [];
        const colorSelector = (key: string) => (
            listToMap(
                verticalAxis,
                (item) => item.label ?? '',
                (item) => item.color ?? '',
            )?.[key] ?? '#717171'
        );

        return {
            data: cacheData,
            title: {
                children: title,
                style: resolveTextStyle(
                    style?.title,
                    undefined,
                ),
            },
            subTitle: {
                children: subTitle,
                style: resolveTextStyle(
                    style?.subTitle,
                    undefined,
                ),
            },
            yValueKeys: yKeys ?? [],
            // groupingMode: configuration?.type === 'STACKED'
            // ? 'stacked' as const : 'side-by-side' as const,
            chartOptions: {
                keySelector: (item: Datum) => item.key ?? '',
                xValueSelector: (item: Datum) => item.key,
                yValueSelector,
                xAxisHeight: 64,
                yDomain: (
                    isDefined(verticalAxisExtendMinimumValue)
                    && isDefined(verticalAxisExtendMaximumValue)
                ) ? ({
                        min: verticalAxisExtendMinimumValue,
                        max: verticalAxisExtendMaximumValue,
                    }) : undefined,
            },
            colorSelector,
            yAxisLabel: {
                children: verticalAxisTitle,
                style: resolveTextStyle(
                    style?.verticalAxisTitle,
                    undefined,
                ),
            },
            xAxisLabel: {
                children: horizontalAxisTitle,
                style: resolveTextStyle(
                    style?.horizontalAxisTitle,
                    undefined,
                ),
            },
            chartAxesOptions: {
                xAxisLineStyle: horizontalAxisLineVisible ? {
                    stroke: 'gray',
                    ...resolveLineStyle(
                        style?.horizontalGridLine,
                        undefined,
                    ),
                } : undefined,
                xAxisGridLineStyle: horizontalGridLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        style?.horizontalGridLine,
                        undefined,
                    ),
                } : undefined,
                yAxisLineStyle: verticalAxisLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        style?.verticalGridLine,
                        undefined,
                    ),
                } : undefined,
                yAxisGridLineStyle: verticalGridLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        style?.verticalGridLine,
                        undefined,
                    ),
                } : undefined,
            },
            barListOptions: {
                //  barGroupGap
                //  barGroupMargin
            },
            children: undefined,
        };
    }, [
        cacheData,
        configuration,
    ]);

    const chartType = configuration?.horizontalAxis?.type ?? 'CATEGORICAL';

    return (
        <div className={_cs(styles.barContent)}>
            {config && chartType === 'CATEGORICAL' && (
                <CategoricalBarChart
                    {...config}
                    // FIXME: Remove these dependencies from categorical bar chart
                    keySelector={config?.chartOptions.keySelector}
                    xValueSelector={config?.chartOptions.xValueSelector}
                    yValueSelector={config?.chartOptions.yValueSelector ?? []}
                />
            )}
            {config && chartType === 'DATE' && (
                <TemporalBarChart
                    {...config}
                    // FIXME: Remove these dependencies from categorical bar chart
                    keySelector={config?.chartOptions.keySelector}
                    xValueSelector={config?.chartOptions.xValueSelector}
                    yValueSelector={config?.chartOptions.yValueSelector ?? []}
                />
            )}
            {/* config && chartType === 'NUMERIC' && (
                <NumericBarChart
                    {...config}
                    // FIXME: Remove these dependencies from categorical bar chart
                    keySelector={config?.chartOptions.keySelector}
                    xValueSelector={config?.chartOptions.xValueSelector}
                    yValueSelector={config?.chartOptions.yValueSelector ?? []}
                />
            ) */}
        </div>
    );
}

export default BarContent;
