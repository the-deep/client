import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function MainFindings(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.mainFindings)}>
            Here
        </div>
    );
}

export default MainFindings;
