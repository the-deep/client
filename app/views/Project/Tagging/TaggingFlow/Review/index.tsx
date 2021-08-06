import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Review(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.review)}>
            Review
        </div>
    );
}

export default Review;
