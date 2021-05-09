import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    payload: {
        value: string | number;
        color: string;
        payload: {
            percent?: number;
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
            {payload.map((entry, index) => {
                const {
                    value,
                    color,
                    payload: {
                        percent,
                    },
                } = entry;

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
                        { isDefined(percent) && (
                            <div className={styles.percent}>
                                {`${100 * percent}%`}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default RechartsLegend;
