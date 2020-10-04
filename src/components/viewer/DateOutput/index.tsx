import React from 'react';
import { _cs } from '@togglecorp/fujs';

import FormattedDate from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';

import styles from './styles.scss';


export interface DateOutputProps {
    className?: string;
    value: string;
}

function DateOutput(props: DateOutputProps) {
    const {
        className,
        value,
    } = props;

    return (
        <div className={_cs(styles.dateOutput, className)}>
            <Icon
                className={styles.icon}
                name="calendar"
            />
            <FormattedDate
                className={styles.date}
                value={value}
                mode="dd-MM-yyyy"
            />
        </div>
    );
}

export default DateOutput;
