import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    error?: {
        $internal?: string | string[];
    };
}

function NonFieldError(props: Props) {
    const {
        error,
        className,
    } = props;

    if (!error?.$internal) {
        return null;
    }

    const children: React.ReactNode = Array.isArray(error.$internal)
        ? error.$internal.join(', ')
        : error.$internal;

    return (
        <div className={_cs(styles.nonFieldError, className)}>
            { children }
        </div>
    );
}

export default NonFieldError;
