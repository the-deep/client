import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export interface TimelineProps {
    className?: string;
}

function Timeline(props: TimelineProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.timeline)}>
            Timeline woo
        </div>
    );
}

export default Timeline;
