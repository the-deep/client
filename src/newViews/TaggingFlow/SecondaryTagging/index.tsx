import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
}

function SecondaryTagging(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.secondaryTagging)}>
            Secondary Tagging
        </div>
    );
}

export default SecondaryTagging;
