import React from 'react';
import { _cs } from '@togglecorp/fujs';

import FormattedDate from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';

import styles from './styles.scss';


export interface DateOutputProps {
    className?: string;
    value: string | undefined;
    label?: string;
    tooltip?: string;
    hideIcon?: boolean;
}

function DateOutput(props: DateOutputProps) {
    const {
        className,
        value,
        label,
        tooltip,
        hideIcon,
    } = props;

    return (
        <div
            className={_cs(styles.dateOutput, className)}
            title={tooltip}
        >
            { ((value || label) && !hideIcon) && (
                <Icon
                    className={styles.icon}
                    name="calendar"
                />
            )}
            { label && (
                <div className={styles.label}>
                    { label }
                </div>
            )}
            <FormattedDate
                className={styles.date}
                value={value}
                mode="dd-MM-yyyy"
            />
        </div>
    );
}

export default DateOutput;
