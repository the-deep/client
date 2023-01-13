import React, { useRef, useMemo, useCallback } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';

import LineChart from './LineChart';

type Count = {
    total: number;
    date: number;
};
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const accentColor = 'var(--dui-color-brand)';
const selectedBrushStyle = {
    fill: `url(#${PATTERN_ID})`,
    stroke: accentColor,
};

// accessors
const getDate = (d: Count) => new Date(d.date);
const valueSelector = (d: Count) => d.total;

// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
    const pathWidth = 8;
    const pathHeight = 15;
    if (!isBrushActive) {
        return null;
    }
    return (
        <Group
            left={x + pathWidth / 2}
            top={(height - pathHeight) / 2}
        >
            <path
                fill="#f2f2f2"
                d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
                stroke="#999999"
                strokeWidth="1"
                style={{ cursor: 'ew-resize' }}
            />
        </Group>
    );
}

export type BrushProps = {
    width: number;
    height: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    data: { total: number; date: number }[] | undefined;
};

function BrushLineChart(props: BrushProps) {
    const {
        width,
        height,
        data = [],
        margin = {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
        },
    } = props;

    const brushRef = useRef<BaseBrush | null>(null);

    const innerHeight = height - margin.top - margin.bottom;
    const chartHeight = innerHeight - chartSeparation;

    // bounds
    const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
    const yBrushMax = Math.max(chartHeight - brushMargin.top - brushMargin.bottom, 0);

    const [minDate, maxDate] = useMemo(
        () => {
            if (data.length <= 0) {
                return [];
            }
            const dates = data
                .map(getDate)
                .map((item) => new Date(item).getTime());
            const min = Math.min(...dates);
            const max = Math.max(...dates);
            return [new Date(min), new Date(max)];
        },
        [data],
    );

    const maxValue = useMemo(
        () => {
            if (data.length <= 0) {
                return 0;
            }
            const values = data.map(valueSelector);
            const max = Math.max(...values);
            return max;
        },
        [data],
    );

    const brushDateScale = useMemo(
        () => scaleTime<number>({
            range: [0, xBrushMax],
            domain: [minDate, maxDate] as [Date, Date],
        }),
        [xBrushMax, minDate, maxDate],
    );
    const brushCountScale = useMemo(
        () => scaleLinear({
            range: [yBrushMax, 0],
            domain: [0, maxValue],
            nice: true,
        }),
        [yBrushMax, maxValue],
    );

    const onBrushChange = useCallback(
        (domain: Bounds | null) => {
            if (!domain) {
                return;
            }
            const { x0, x1, y0, y1 } = domain;
            const countCopy = data.filter((s) => {
                const x = getDate(s).getTime();
                const y = valueSelector(s);
                return x > x0 && x < x1 && y > y0 && y < y1;
            });
            console.warn('brush changed', domain, countCopy);
        },
        [data],
    );

    const onBrushClick = useCallback(
        () => {
            console.warn('brush clicked');
        },
        [],
    );

    /*
    const initialBrushPosition = useMemo(
        () => ({
            start: { x: brushDateScale(getDate(count[50])) },
            end: { x: brushDateScale(getDate(count[100])) },
        }),
        [brushDateScale],
    );

    // event handlers
    const handleClearClick = () => {
        if (brushRef?.current) {
            setFilteredCount(count);
            brushRef.current.reset();
        }
    };

    const handleResetClick = () => {
        if (brushRef?.current) {
            const updater: UpdateBrush = (prevBrush) => {
                const newExtent = brushRef.current.getExtent(
                    initialBrushPosition.start,
                    initialBrushPosition.end,
                );

                const newState: BaseBrushState = {
                    ...prevBrush,
                    start: { y: newExtent.y0, x: newExtent.x0 },
                    end: { y: newExtent.y1, x: newExtent.x1 },
                    extent: newExtent,
                };

                return newState;
            };
            brushRef.current.updateBrush(updater);
        }
    };
    */

    return (
        <svg
            width={width}
            height={height}
        >
            <LineChart
                hideBottomAxis
                hideLeftAxis
                data={data}
                width={width}
                yMax={yBrushMax}
                xScale={brushDateScale}
                yScale={brushCountScale}
                margin={brushMargin}
                top={margin.top}
            >
                <PatternLines
                    id={PATTERN_ID}
                    height={8}
                    width={8}
                    stroke={accentColor}
                    strokeWidth={1}
                    orientation={['diagonal']}
                />
                <Brush
                    xScale={brushDateScale}
                    yScale={brushCountScale}
                    width={xBrushMax}
                    height={yBrushMax}
                    margin={brushMargin}
                    handleSize={8}
                    innerRef={brushRef}
                    resizeTriggerAreas={['left', 'right']}
                    brushDirection="horizontal"
                    initialBrushPosition={undefined}
                    onChange={onBrushChange}
                    onClick={onBrushClick}
                    selectedBoxStyle={selectedBrushStyle}
                    useWindowMoveEvents
                    renderBrushHandle={(brushProps) => <BrushHandle {...brushProps} />}
                />
            </LineChart>
        </svg>
    );
}

export default BrushLineChart;
