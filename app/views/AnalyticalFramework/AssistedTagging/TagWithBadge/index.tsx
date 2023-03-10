import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    Tag,
    DraggableContent,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    children: React.ReactNode;
    badgeCount?: number;
    badgeKey: string;
}

function TagWithBadge(props: Props) {
    const {
        className,
        children,
        badgeCount = 0,
        badgeKey,
    } = props;

    const dragValue = useMemo(() => ({
        badgeKey,
    }), [badgeKey]);

    return (
        <Tag
            className={_cs(
                className,
                styles.checkButton,
                badgeCount > 0 && styles.nlp,
            )}
            actionsContainerClassName={styles.actions}
            actions={badgeCount > 0 && badgeCount}
            spacing="none"
        >
            <DraggableContent
                name="tags"
                value={dragValue}
                dropEffect="move"
                className={styles.dragContainer}
                headerClassName={styles.header}
                headingClassName={styles.heading}
                spacing="compact"
                dragByContainer
            >
                {children}
            </DraggableContent>
        </Tag>
    );
}

export default TagWithBadge;
