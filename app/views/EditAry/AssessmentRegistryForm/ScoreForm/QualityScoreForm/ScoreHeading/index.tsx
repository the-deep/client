import React from 'react';
import { Heading } from '@the-deep/deep-ui';
import styles from './styles.css';

export interface Props {
    analyticalState?: string;
    children?: React.ReactNode;
}

function ScoreHeading(props: Props) {
    const {
        analyticalState,
        children,
    } = props;

    return (
        <div className={styles.headingContainer}>
            <div className={styles.headingContent}>
                <Heading
                    size="extraSmall"
                    className={styles.scoreHeading}
                >
                    {analyticalState}
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.scoreHeading}
                >
                    Score
                </Heading>
                <Heading
                    size="extraSmall"
                    className={styles.scoreHeading}
                >
                    Justification
                </Heading>
            </div>
            <div className={styles.children}>
                {children}
            </div>
        </div>
    );
}

export default ScoreHeading;
