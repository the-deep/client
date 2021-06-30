import React from 'react';
import {
    _cs,
    isDefined,
    bound,
} from '@togglecorp/fujs';

import Numeral from '#rscv/Numeral';

/*
eslint css-modules/no-unused-class: [
    1,
    {
        markAsUsed: [
            'complement1', 'complement2', 'complement3', 'small', 'large',
        ],
        camelCase: true
    }
]
*/
import styles from './styles.scss';

interface Props {
    className?: string;
    progressClassName?: string;
    title?: string;
    progress: number;
    variant?: 'complement1' | 'complement2' | 'complement3';
    size?: 'small' | 'large';
}

function ProgressLine(props: Props) {
    const {
        className,
        progressClassName,
        progress,
        title,
        variant = 'complement1',
        size = 'small',
    } = props;

    const progressWidth = `${bound(isDefined(progress) ? progress : 0, 0, 100)}%`;

    return (
        <div className={_cs(styles.progressBar, className)}>
            <div className={_cs(styles.numberCircle, styles[variant])}>
                <Numeral
                    value={progress}
                    precision={0}
                    suffix="%"
                />
            </div>
            <div className={styles.right}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={_cs(styles.line, styles[size])}>
                    <div
                        style={{
                            width: progressWidth,
                        }}
                        className={
                            _cs(
                                styles.progress,
                                progressClassName,
                                styles[variant],
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default ProgressLine;
