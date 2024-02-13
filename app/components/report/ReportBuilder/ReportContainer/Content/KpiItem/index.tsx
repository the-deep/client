import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
    title?: string;
    subtitle?: string;
    abbreviateValue?: string;
    source?: string;
    sourceTitle?: string;
    value?: number;
}

function KpiItem(props: Props) {
    const {
        className,
        title,
        subtitle,
        value = 0,
    } = props;

    return (
        <div className={_cs(styles.kpiItem, className)}>
            {title}
        </div>
    );
}

export default KpiItem;
