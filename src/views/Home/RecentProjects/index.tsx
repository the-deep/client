import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    selectedProject?: number;
}

function RecentProjects(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.recentProjects)} />
    );
}

export default RecentProjects;
