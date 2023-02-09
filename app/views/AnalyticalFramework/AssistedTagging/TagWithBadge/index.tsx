import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tag,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    badgeCount?: number;
}

function TagWithBadge(props: Props) {
    const {
        className,
        children,
        badgeCount = 0,
    } = props;

    return (
        <Tag
            className={_cs(
                className,
                styles.checkButton,
                badgeCount > 0 && styles.nlp,
            )}
            actionsContainerClassName={styles.actions}
            actions={badgeCount > 0 && badgeCount}
        >
            {children}
        </Tag>
    );
}

export default TagWithBadge;
