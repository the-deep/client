import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

function Card(props: Props) {
    const {
        className,
        children,
    } = props;

    return (
        <div className={_cs(styles.card, className)}>
            { children }
        </div>
    );
}

export default Card;
