import React from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { internal } from '@togglecorp/toggle-form';

import styles from './styles.css';

interface Props {
    className?: string;
    error?: string | {
        [internal]?: string | string[];
    };
}

function NonFieldError(props: Props) {
    const {
        error,
        className,
    } = props;

    if (isNotDefined(error)) {
        return null;
    }

    if (typeof error === 'string') {
        return (
            <div className={_cs(styles.nonFieldError, className)}>
                {error}
            </div>
        );
    }

    const internalError = error?.[internal];

    if (!internalError) {
        return null;
    }

    const children: React.ReactNode = Array.isArray(internalError)
        ? internalError.join(', ')
        : internalError;

    return (
        <div className={_cs(styles.nonFieldError, className)}>
            { children }
        </div>
    );
}

export default NonFieldError;
