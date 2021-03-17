import React, { useCallback } from 'react';
import {
    _cs,
    compareNumber,
} from '@togglecorp/fujs';

import ListView from '#rsu/../v2/View/ListView';
import styles from './styles.scss';

export type MinMax = [number, number];

interface TimeElementProps {
    label: React.ReactNode;
    left: number;
}

function TimeElement(props: TimeElementProps) {
    const {
        left,
        label,
    } = props;

    return (
        <div
            className={styles.timelineItem}
            style={{
                left: `${left}%`,
            }}
        >
            <div className={styles.bar} />
            <div className={styles.head} />
            <div className={styles.label}>
                { label }
            </div>
        </div>
    );
}

interface AxisTickProps {
    left: number;
    tickLabel: React.ReactNode;
}

function AxisTick(props: AxisTickProps) {
    const {
        left,
        tickLabel,
    } = props;

    return (
        <div
            className={styles.tick}
            style={{
                left: `${left}%`,
            }}
        >
            <div className={styles.bar} />
            <div className={styles.label}>
                {tickLabel}
            </div>
        </div>
    );
}

export interface TimelineProps<T> {
    className?: string;
    data: T[];
    keySelector: (item: T) => string | number;
    valueSelector: (item: T) => number;
    labelSelector: (item: T) => React.ReactNode;
    tickLabelSelector: (item: number) => React.ReactNode;
    domain?: MinMax;
}

const scale = (domain: MinMax, range: MinMax, value: number) => {
    const [minDomain, maxDomain] = domain;
    const [minRange, maxRange] = range;
    const normalizedValue = (value - minDomain) / (maxDomain - minDomain);
    const newValue = (normalizedValue * (maxRange - minRange)) + minRange;
    return newValue;
};

const axisTickKeySelector = (d: number) => d;
const range: MinMax = [0, 100];

function Timeline<T>(props: TimelineProps<T>) {
    const {
        className,
        labelSelector,
        valueSelector,
        keySelector,
        tickLabelSelector,
        data,
        domain: domainFromProps,
    } = props;


    const domain: MinMax = React.useMemo(() => {
        if (domainFromProps) {
            return domainFromProps;
        }
        if (data.length > 0) {
            return [
                Math.min(...data.map(valueSelector)),
                Math.max(...data.map(valueSelector)),
            ];
        }
        return [0, 0];
    }, [domainFromProps, data, valueSelector]);

    const axisTicks = React.useMemo(() => {
        const [minDomain, maxDomain] = domain;
        const maxTicks = 5;

        const domainLength = maxDomain - minDomain;
        const increment = domainLength / (maxTicks - 1);

        return Array.from(
            { length: maxTicks },
            (v, i) => Math.round(minDomain + (i * increment)),
        );
    }, [domain]);

    const timeElementRendererParams = useCallback((key, datum) => ({
        left: scale(domain, range, valueSelector(datum)),
        label: labelSelector(datum),
    }), [labelSelector, valueSelector, domain]);

    const axisTickRendererParams = useCallback((key, datum) => ({
        left: scale(domain, range, datum),
        tickLabel: tickLabelSelector(datum),
    }), [tickLabelSelector, domain]);

    const renderData = React.useMemo(() => (
        [...data].sort((a, b) => (compareNumber(valueSelector(a), valueSelector(b))))
    ), [data, valueSelector]);

    if (data.length === 0) {
        return null;
    }


    return (
        <div className={_cs(className, styles.timeline)}>
            <div className={styles.container}>
                <ListView
                    className={styles.timelineItemList}
                    data={renderData}
                    renderer={TimeElement}
                    keySelector={keySelector}
                    rendererParams={timeElementRendererParams}
                />
                <ListView
                    className={styles.axis}
                    data={axisTicks}
                    renderer={AxisTick}
                    keySelector={axisTickKeySelector}
                    rendererParams={axisTickRendererParams}
                />
            </div>
        </div>
    );
}

export default Timeline;
