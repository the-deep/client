import React, { ReactElement } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tag,
    useButtonFeatures,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    file: string | null | undefined;
    icon: ReactElement;
    status: string;
    tagVariant: 'default' | 'accent' | 'complement1' | 'complement2';
}

function Status(props: Props) {
    const {
        className,
        file,
        tagVariant,
        icon,
        status,
    } = props;

    const {
        className: buttonClassName,
        children,
    } = useButtonFeatures({
        variant: 'secondary',
        children: status,
        actions: icon,
    });

    return (
        <div className={_cs(className, styles.status)}>
            {file ? (
                <a
                    href={file}
                    className={buttonClassName}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            ) : (
                <Tag
                    variant={tagVariant}
                    actions={icon}
                >
                    {status}
                </Tag>
            )}
        </div>
    );
}

export default Status;
