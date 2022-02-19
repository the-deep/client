import React from 'react';
import { Container } from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    title: string;
    children: React.ReactNode;
}

function CellGroup(props: Props) {
    const {
        title,
        children,
    } = props;

    return (
        <Container
            className={styles.cellGroup}
            heading={title}
            headingSize="extraSmall"
            spacing="compact"
            contentClassName={styles.cellGroupContent}
        >
            {children}
        </Container>
    );
}

export default CellGroup;
