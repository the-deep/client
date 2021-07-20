import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
}

function PrimaryTagging(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.primaryTagging)}>
            Primary Tagging
        </div>
    );
}

export default PrimaryTagging;
