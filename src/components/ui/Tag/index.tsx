import React, { ReactNode } from 'react';

import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export type TagVariant = (
    'default'
    | 'accent'
    | 'complement1'
    | 'complement2'
    | 'gradient1'
    | 'gradient2'
    | 'gradient3'
    | 'gradient4'
)

interface Props {
    className?: string;
    label: string;
    action?: ReactNode;
    actionClassName?: string;
    variant?: TagVariant;
}

function Tag(props: Props) {
    const {
        className,
        label,
        action,
        actionClassName,
        variant = 'default',
    } = props;

    const style = _cs(
        className,
        styles.tag,
        styles[variant],
    );

    return (
        <div className={style}>
            <div>
                {label}
            </div>
            { action && (
                <div className={_cs(styles.action, actionClassName)}>
                    {action}
                </div>
            )}
        </div>
    );
}

export default Tag;
