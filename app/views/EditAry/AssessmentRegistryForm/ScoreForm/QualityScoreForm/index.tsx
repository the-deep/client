import React from 'react';
import { Heading } from '@the-deep/deep-ui';

import QualityScoreInput from './QualityScoreInput';
import styles from './styles.css';

function QualityScoreForm() {
    return (
        <div className={styles.qualityScoreForm}>
            <div className={styles.scoreContent}>
                <Heading
                    size="extraSmall"
                    className={styles.scoreHeading}
                >
                    Fit For Purpose
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
            <QualityScoreInput />
        </div>
    );
}

export default QualityScoreForm;
