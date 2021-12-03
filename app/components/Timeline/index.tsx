import React, { useCallback } from 'react';
import {
    _cs,
    compareNumber,
} from '@togglecorp/fujs';
import {
    ListView,
} from '@the-deep/deep-ui';

import styles from './styles.css';

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
            <div className={styles.axisLabel}>
                {tickLabel}
            </div>
        </div>
    );
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

export interface TimelineProps<T> {
    className?: string;
    data: T[];
    keySelector: (item: T) => string | number;
    valueSelector: (item: T) => number;
    labelSelector: (item: T) => React.ReactNode;
    tickLabelSelector: (item: number) => React.ReactNode;
    domain?: MinMax;
    minDomainExtent?: number;
}

function Timeline<T>(props: TimelineProps<T>) {
    const {
        className,
        labelSelector,
        valueSelector,
        keySelector,
        tickLabelSelector,
        data,
        domain: domainFromProps,
        minDomainExtent = 7776000000, // 3 months
    } = props;

    const domain: MinMax = React.useMemo(() => {
        if (domainFromProps) {
            return domainFromProps;
        }

        if (data.length > 0) {
            const min = Math.min(...data.map(valueSelector));
            const max = Math.max(...data.map(valueSelector));

            if (max - min >= minDomainExtent) {
                return [min, max];
            }

            const extension = Math.floor(minDomainExtent / 2);
            return [min - extension, max + extension];
        }

        return [0, 0];
    }, [domainFromProps, data, valueSelector, minDomainExtent]);

    const axisTicks = React.useMemo(() => {
        const [minDomain, maxDomain] = domain;
        const maxTicks = 5;

        const domainLength = maxDomain - minDomain;
        const increment = domainLength / (maxTicks - 1);

        return Array.from(
            { length: maxTicks },
            (_, i) => Math.round(minDomain + (i * increment)),
        );
    }, [domain]);

    const timeElementRendererParams = useCallback((_: string | number, datum: T) => ({
        left: scale(domain, range, valueSelector(datum)),
        label: labelSelector(datum),
    }), [labelSelector, valueSelector, domain]);

    const axisTickRendererParams = useCallback((_: string | number, datum: number) => ({
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
                    filtered={false}
                    pending={false}
                />
                <ListView
                    className={styles.axis}
                    data={axisTicks}
                    renderer={AxisTick}
                    keySelector={axisTickKeySelector}
                    rendererParams={axisTickRendererParams}
                    filtered={false}
                    pending={false}
                />
            </div>
        </div>
    );
}

export default Timeline;
