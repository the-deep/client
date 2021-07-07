import React from 'react';
import { _cs } from '@togglecorp/fujs';

import FormattedDate from '#rscv/FormattedDate';

import _ts from '#ts';

import styles from './styles.scss';

const emptyComponent = () => null;

interface DateRangeProps {
    className?: string;
    startDate?: string;
    endDate?: string;
}

function DateRangeOutput(props: DateRangeProps) {
    const {
        className,
        startDate,
        endDate,
    } = props;

    return (
        <div className={_cs(styles.dateRangeOutput, className)}>
            <FormattedDate
                title={_ts('components.dateRangeOutput', 'startDateLabel')}
                value={startDate}
                mode="MMM yyyy"
                emptyComponent={emptyComponent}
            />
            {startDate && endDate && (
                <div className={styles.separator}>-</div>
            )}
            <FormattedDate
                title={_ts('components.dateRangeOutput', 'endDateLabel')}
                value={endDate}
                mode="MMM yyyy"
                emptyComponent={emptyComponent}
            />
        </div>
    );
}

export default DateRangeOutput;
