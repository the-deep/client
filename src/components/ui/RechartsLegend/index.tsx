import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    payload?: {
        value: string | number;
        color: string;
        payload: {
            strokeDasharray: React.ReactText;
            // percent?: number;
        }
    }[];
}

function RechartsLegend(props: Props) {
    const {
        className,
        payload,
    } = props;

    return (
        <div className={_cs(styles.legend, className)}>
            {payload?.map((entry, index) => {
                const {
                    value,
                    color,
                    payload: localPayload,
                } = entry;

                interface LocalPayload {
                    percent?: number;
                }

                const percent = (localPayload as unknown as LocalPayload)?.percent;

                const key = `legend-item-${index}`;

                return (
                    <div
                        key={key}
                        className={styles.legendElement}
                    >
                        <div className={styles.colorContainer}>
                            <div
                                style={{ backgroundColor: color }}
                                className={styles.color}
                            />
                        </div>
                        <div className={styles.value} >
                            { value }
                        </div>
                        {isDefined(percent) && (
                            <div className={styles.percent}>
                                {`${Math.round(10000 * percent) / 100}%`}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default RechartsLegend;
