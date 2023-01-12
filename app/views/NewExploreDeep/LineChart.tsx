import React, { useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveLinear } from '@visx/curve';
import { localPoint } from '@visx/event';
import { ScaleTime, ScaleLinear } from 'd3-scale';
import { max, extent, bisector } from 'd3-array';
import { useTooltip, Tooltip, defaultStyles } from '@visx/tooltip';

import { AppleStock } from '@visx/mock-data/lib/mocks/appleStock';

const bisectDate = bisector<AppleStock, Date>((d) => new Date(d.date)).left;

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
const getDate = (d: AppleStock) => new Date(d.date);
const getStockValue = (d: AppleStock) => d.close;

const gradientColor = 'var(--dui-color-accent)';

interface Props {
    data: AppleStock[];
    xScale: ScaleTime<number>;
    yScale: ScaleLinear<number>;
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

    const {
        showTooltip,
        hideTooltip,
    } = useTooltip();

    const getX = useCallback(
        (datum: AppleStock) => xScale(getDate(datum)) ?? 0,
        [xScale],
    );

    const getY = useCallback(
        (datum: AppleStock) => yScale(getStockValue(datum)) ?? 0,
        [yScale],
    );

    const handleTooltip = useCallback(
        (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
            const { x } = localPoint(event) || { x: 0 };
            const x0 = xScale.invert(x);
            const index = bisectDate(data, x0, 1);
            const d0 = data[index - 1];
            const d1 = data[index];

            let d = d0;
            if (d1 && getDate(d1)) {
                d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
            }
            showTooltip({
                tooltipData: d,
                tooltipLeft: x,
                tooltipTop: yScale(getStockValue(d)),
            });
        },
        [data, xScale, yScale, showTooltip],
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
            <AreaClosed<AppleStock>
                data={data}
                x={getX}
                y={getY}
                yScale={yScale}
                fill="url(#area-gradient)"
                curve={curveLinear}
            />
            <LinePath<AppleStock>
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
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => hideTooltip()}
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
