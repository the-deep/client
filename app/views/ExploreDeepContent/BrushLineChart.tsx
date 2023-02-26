import {
    VictoryGroup,
    VictoryBrushContainer,
    VictoryLine,
    VictoryAxis,
    VictoryArea,
} from 'victory';
import React, { useMemo, useCallback } from 'react';

interface Props {
    height: number;
    width: number;
    startDate: number | undefined;
    endDate: number | undefined;
    onChange: (startDate: number | undefined, endDate: number | undefined) => void;
    data: { total: number, date: number }[];
    readOnly?: boolean;
}

function BrushLineChart(props: Props) {
    const {
        width,
        height,
        data,
        startDate,
        endDate,
        onChange,
        readOnly = false,
    } = props;

    const maxCount = useMemo(() => Math.max(...data.map((datum) => datum.total)), [data]);

    const selectedDomain = useMemo(
        () => (startDate && endDate ? {
            x: [
                new Date(startDate),
                new Date(endDate),
            ],
            y: [
                0,
                maxCount,
            ],
        } : undefined),
        [startDate, endDate, maxCount],
    );

    const handleBrush = useCallback(
        (value: { x: [Date | number, Date | number] } | undefined) => {
            if (!value) {
                onChange(undefined, undefined);
            } else {
                onChange(
                    new Date(value.x[0]).getTime(),
                    new Date(value.x[1]).getTime(),
                );
            }
        },
        [onChange],
    );

    return (
        <div>
            <svg style={{ height: 0 }}>
                <defs>
                    <linearGradient
                        id="area-chart-bg"
                        gradientTransform="rotate(90)"
                    >
                        <stop offset="0%" stopColor="var(--dui-color-accent)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--dui-color-accent)" stopOpacity={0} />
                    </linearGradient>
                </defs>
            </svg>
            <VictoryGroup
                // Need to dismount chart when width changes
                // https://github.com/FormidableLabs/victory/issues/1173
                key={width}
                width={width}
                height={height}
                scale={{ x: 'time', y: 'linear' }}
                minDomain={{ y: 0 }}
                padding={{ top: 10, left: 10, right: 10, bottom: 10 }}
                containerComponent={(
                    <VictoryBrushContainer
                        brushDimension="x"
                        brushDomain={selectedDomain}
                        onBrushDomainChangeEnd={handleBrush} // changeEnd?
                        allowDrag={!readOnly}
                        allowResize={!readOnly}
                        allowDraw={false}
                        brushStyle={{
                            stroke: 'var(--dui-color-brand)',
                            fill: 'var(--dui-color-accent)',
                            fillOpacity: 0.1,
                        }}
                        defaultBrushArea="all"
                    />
                )}
            >
                <VictoryArea
                    style={{
                        data: { fill: 'url(#area-chart-bg)' },
                    }}
                    x="date"
                    y="total"
                    sortKey="date"
                    data={data}
                />
                <VictoryAxis />
                <VictoryLine
                    style={{ data: { stroke: 'var(--dui-color-accent)' } }}
                    x="date"
                    y="total"
                    sortKey="date"
                    data={data}
                />
            </VictoryGroup>
        </div>
    );
}

export default BrushLineChart;
