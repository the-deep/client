import React, { useMemo } from 'react';
import {
    _cs,
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import {
    NumericLineChart,
} from '@the-deep/reporting-module-components';

import {
    type LineChartConfigType,
} from '../../../../schema';
import {
    resolveTextStyle,
    resolveLineStyle,
} from '../../../../utils';

import styles from './styles.css';

type Datum = Record<string, string | number | undefined>;

interface Props {
    configuration?: LineChartConfigType;
    cacheData: Datum[] | undefined;
}

function LineContent(props: Props) {
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
            configuration?.verticalAxis?.map((item) => {
                const safeNumber = Number((item.label ? axis[item.label] : undefined));

                return ({
                    key: item.label ?? '',
                    value: !Number.isNaN(safeNumber) ? safeNumber : 0,
                });
            })
        ) ?? [];
        const colorSelector = (key: string) => (
            listToMap(
                configuration?.verticalAxis,
                (item) => item.label ?? '',
                (item) => item.color ?? '',
            )?.[key] ?? '#717171'
        );
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
                xValueSelector: (item: Datum) => (
                    Number.isNaN(Number(item.key)) ? undefined : Number(item.key)
                ),
                yValueSelector,
                xAxisHeight: 64,
                yDomain: (
                    isDefined(configuration?.verticalAxisExtendMinimumValue)
                    && isDefined(configuration?.verticalAxisExtendMaximumValue)
                ) ? ({
                        min: configuration?.verticalAxisExtendMinimumValue,
                        max: configuration?.verticalAxisExtendMaximumValue,
                    }) : undefined,
            },
            colorSelector,
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
            chartAxesOptions: {
                xAxisLineStyle: configuration?.horizontalAxisLineVisible ? {
                    stroke: 'gray',
                    ...resolveLineStyle(
                        configuration?.style?.horizontalGridLine,
                        undefined,
                    ),
                } : undefined,
                xAxisGridLineStyle: configuration?.horizontalGridLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        configuration?.style?.horizontalGridLine,
                        undefined,
                    ),
                } : undefined,
                yAxisLineStyle: configuration?.verticalAxisLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        configuration?.style?.verticalGridLine,
                        undefined,
                    ),
                } : undefined,
                yAxisGridLineStyle: configuration?.verticalGridLineVisible ? {
                    stroke: 'lightgray',
                    ...resolveLineStyle(
                        configuration?.style?.verticalGridLine,
                        undefined,
                    ),
                } : undefined,
            },
            children: undefined,
        };
    }, [
        cacheData,
        configuration,
    ]);

    return (
        <div className={_cs(styles.barContent)}>
            {config && (
                <NumericLineChart
                    {...config}
                    // FIXME: Remove these dependencies from categorical bar chart
                    keySelector={config?.chartOptions.keySelector}
                    xValueSelector={config?.chartOptions.xValueSelector}
                    yValueSelector={config?.chartOptions.yValueSelector ?? []}
                />
            )}
        </div>
    );
}

export default LineContent;
