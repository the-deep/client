import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

function Icons(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(className, styles.icons)}>
            { children }
        </div>
    );
}

export default Icons;
