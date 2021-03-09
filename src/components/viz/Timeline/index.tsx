import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export type MinMax = [number, number];

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

    const domain: MinMax = React.useMemo(() => domainFromProps ?? [
        Math.min(...data.map(valueSelector)),
        Math.max(...data.map(valueSelector)),
    ], [domainFromProps, data, valueSelector]);

    const range: MinMax = [0, 100];
    const axisTicks = React.useMemo(() => {
        const [minDomain, maxDomain] = domain;
        const maxTicks = 5;

        const domainLength = maxDomain - minDomain;
        const increment = domainLength / (maxTicks - 1);

        const ticks = [];
        for (let i = 0; i < maxTicks; i += 1) {
            ticks.push(Math.round(minDomain + (i * increment)));
        }

        return ticks;
    }, [domain]);

    return (
        <div className={_cs(className, styles.timeline)}>
            <div className={styles.container}>
                <div className={styles.timelineItemList}>
                    { data.map((d) => {
                        const value = valueSelector(d);
                        const key = keySelector(d);
                        const left = scale(domain, range, value);
                        const label = labelSelector(d);

                        return (
                            <div
                                key={key}
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
                    })}
                </div>
                <div className={styles.axis}>
                    { axisTicks.map(d => (
                        <div
                            key={d}
                            className={styles.tick}
                            style={{
                                left: `${scale(domain, range, d)}%`,
                            }}
                        >
                            <div className={styles.bar} />
                            <div className={styles.label}>
                                { tickLabelSelector(d) }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Timeline;
