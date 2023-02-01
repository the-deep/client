import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Tag,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    title: string;
    rightContent: React.ReactNode;
}

function FrameworkTagRow(props: Props) {
    const {
        className,
        title,
        rightContent,
    } = props;

    return (
        <div className={_cs(styles.frameworkTagRow, className)}>
            <div className={styles.leftContainer}>
                <Tag>
                    {title}
                </Tag>
            </div>
            <div className={styles.rightContainer}>
                {rightContent}
            </div>
        </div>
    );
}

export default FrameworkTagRow;
