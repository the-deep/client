import React from 'react';
import { arc } from 'd3-shape';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const arcGenerator = arc().cornerRadius(5);

interface Props {
    width: number;
    arcWidth: number;
    value: number;
    className?: string;
    filledArcClassName?: string;
    unfilledArcClassName?: string;
    children?: React.ReactNode;
}

function CircularProgressBar(props: Props) {
    const {
        width,
        arcWidth,
        value,
        className,
        children,
        unfilledArcClassName,
        filledArcClassName,
    } = props;

    const height = width;
    const arcOuterRadius = width / 2;
    const arcInnerRadius = (width / 2) - arcWidth;

    const progressArc = React.useCallback((v: number) => arcGenerator({
        endAngle: 2 * Math.PI * v,
        innerRadius: arcInnerRadius,
        outerRadius: arcOuterRadius,
        startAngle: 0,
    }), [arcInnerRadius, arcOuterRadius]);

    const unfilledPathData = React.useMemo(() => progressArc(1), [progressArc]);
    const filledPathData = React.useMemo(() => progressArc(value / 100), [progressArc, value]);

    const radius = width / 2;

    return (
        <svg className={_cs(styles.progressBar, className)} height={height} width={width}>
            <g transform={`translate(${radius}, ${radius})`}>
                <path
                    className={_cs(styles.unfilledArc, unfilledArcClassName)}
                    d={unfilledPathData ?? undefined}
                />
            </g>
            <g transform={`translate(${radius}, ${radius})`}>
                <path
                    className={_cs(styles.filledArc, filledArcClassName)}
                    d={filledPathData ?? undefined}
                />
            </g>
            { children && (
                <foreignObject
                    width={width}
                    height={height}
                >
                    {children}
                </foreignObject>
            )}
        </svg>
    );
}

export default CircularProgressBar;
