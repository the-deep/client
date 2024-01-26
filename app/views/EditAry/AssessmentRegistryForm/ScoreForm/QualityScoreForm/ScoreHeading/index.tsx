import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Heading } from '@the-deep/deep-ui';
import styles from './styles.css';

export interface Props {
    className?: string;
    children: React.ReactNode;
    analyticalState: string;
}

function ScoreHeading(props: Props) {
    const {
        analyticalState,
        className,
        children,
    } = props;

    return (
        <div className={_cs(className, styles.headingContainer)}>
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
