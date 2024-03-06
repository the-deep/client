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
        if (!cacheData) {
            return undefined;
        }
        const yKeys = configuration?.verticalAxis?.map((item) => item.label).filter(isDefined);
        const yValueSelector = (axis: Datum) => (
            configuration?.verticalAxis?.map((item) => ({
                key: item.label ?? '',
                value: Number((item.label ? axis[item.label] : undefined)) ?? 0,
            }))
        ) ?? [];
        const colorSelector = (key: string) => (
            listToMap(
                configuration?.verticalAxis,
                (item) => item.label ?? '',
                (item) => item.color ?? '',
            )?.[key] ?? '#717171'
        ) ?? [];
        return {
            data: cacheData,
            title: {
                children: configuration?.title,
                style: resolveTextStyle(
                    configuration?.style?.title,
                    undefined,
                ),
            },
            subTitle: {
                children: configuration?.subTitle,
                style: resolveTextStyle(
                    configuration?.style?.subTitle,
                    undefined,
                ),
            },
            yValueKeys: yKeys ?? [],
            chartOptions: {
                keySelector: (item: Datum) => item.key ?? '',
                xValueSelector: (item: Datum) => item.key,
                yValueSelector,
                xAxisHeight: 64,
            },
            colorSelector,
            chartAxesOptions: {
                yAxisLabel: {
                    children: configuration?.verticalAxisTitle,
                    style: resolveTextStyle(
                        configuration?.style?.verticalAxisTitle,
                        undefined,
                    ),
                },
                xAxisLabel: {
                    children: configuration?.horizontalAxisTitle,
                    style: resolveTextStyle(
                        configuration?.style?.horizontalAxisTitle,
                        undefined,
                    ),
                },
                xAxisLineStyle: {
                    stroke: 'gray',
                },
                xAxisGridLineStyle: {
                    stroke: 'lightgray',
                },
                yAxisLineStyle: {
                    stroke: 'lightgray',
                },
                yAxisGridLineStyle: {
                    stroke: 'lightgray',
                },
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
