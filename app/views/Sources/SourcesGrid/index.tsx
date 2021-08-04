import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function SourcesGrid(props: Props) {
    const { className } = props;

    return (
        <div className={_cs(styles.sourcesGrid, className)}>
            Grid view
        </div>
    );
}

export default SourcesGrid;
