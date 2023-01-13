import React, { useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveLinear } from '@visx/curve';
import { ScaleTime, ScaleLinear } from 'd3-scale';

type Count = {
    total: number;
    date: number;
};
// Initialize some variables
const axisColor = '#666';
const axisBottomTickLabelProps = () => ({
    textAnchor: 'middle' as const,
    fontFamily: 'Arial',
    fontSize: 10,
    fill: axisColor,
});
const axisLeftTickLabelProps = () => ({
    dx: '-0.25em',
    dy: '0.25em',
    fontFamily: 'Arial',
    fontSize: 10,
    textAnchor: 'end' as const,
    fill: axisColor,
});

// accessors
const getDate = (d: Count) => new Date(d.date);
const getStockValue = (d: Count) => d.total;

const gradientColor = 'var(--dui-color-accent)';

interface Props {
    data: Count[];
    xScale: ScaleTime<number, number, never>;
    yScale: ScaleLinear<number, number, never>;
    width: number;
    yMax: number;
    margin: { top: number; right: number; bottom: number; left: number };
    hideBottomAxis?: boolean;
    hideLeftAxis?: boolean;
    top?: number;
    left?: number;
    children?: React.ReactNode;
}

export default function LineChart(props: Props) {
    const {
        data,
        width,
        yMax,
        xScale,
        yScale,
        hideBottomAxis = false,
        hideLeftAxis = false,
        top,
        left,
        margin,
        children,
    } = props;

    const getX = useCallback(
        (datum: Count) => xScale(getDate(datum)) ?? 0,
        [xScale],
    );

    const getY = useCallback(
        (datum: Count) => yScale(getStockValue(datum)) ?? 0,
        [yScale],
    );

    if (width < 10) {
        return null;
    }

    return (
        <Group
            left={left ?? margin.left}
            top={top || margin.top}
        >
            <LinearGradient
                id="area-gradient"
                from={gradientColor}
                fromOpacity={0.2}
                to={gradientColor}
                toOpacity={0}
            />
            <AreaClosed<Count>
                data={data}
                x={getX}
                y={getY}
                yScale={yScale}
                fill="url(#area-gradient)"
                curve={curveLinear}
            />
            <LinePath<Count>
                data={data}
                x={getX}
                y={getY}
                strokeWidth={2}
                stroke={gradientColor}
                curve={curveLinear}
            />
            <Bar
                x={margin.left}
                y={margin.top}
                width={width}
                height={yMax}
                fill="transparent"
                rx={14}
            />
            {!hideBottomAxis && (
                <AxisBottom
                    top={yMax}
                    scale={xScale}
                    numTicks={Math.floor(width / 70) - 2}
                    stroke={axisColor}
                    tickStroke={axisColor}
                    tickLabelProps={axisBottomTickLabelProps}
                />
            )}
            {!hideLeftAxis && (
                <AxisLeft
                    scale={yScale}
                    numTicks={5}
                    stroke={axisColor}
                    tickStroke={axisColor}
                    tickLabelProps={axisLeftTickLabelProps}
                />
            )}
            {children}
        </Group>
    );
}
