import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Container } from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    title: string;
    direction?: 'vertical' | 'horizontal';
    children: React.ReactNode;
}

function CellGroup(props: Props) {
    const {
        title,
        children,
        direction = 'horizontal',
    } = props;

    return (
        <Container
            className={styles.cellGroup}
            heading={title}
            headingSize="extraSmall"
            spacing="compact"
            contentClassName={_cs(
                styles.cellGroupContent,
                direction === 'vertical' && styles.vertical,
            )}
        >
            {children}
        </Container>
    );
}

export default CellGroup;
