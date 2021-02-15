import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Card from '../Card';
import Container, { ContainerProps } from '../Container';
import styles from './styles.scss';

function ContainerCard(props: ContainerProps) {
    const {
        className,
        headerClassName,
        contentClassName,
        ...otherProps
    } = props;

    return (
        <Card className={_cs(styles.containerCard, className)}>
            <Container
                className={styles.container}
                headerClassName={_cs(styles.header, headerClassName)}
                contentClassName={_cs(styles.content, contentClassName)}
                {...otherProps}
            />
        </Card>
    );
}

export default ContainerCard;
