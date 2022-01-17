import React from 'react';
import {
    _cs,
    isDefined,
    bound,
} from '@togglecorp/fujs';
import {
    NumberOutput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    className?: string;
    progressClassName?: string;
    title?: string;
    progress?: number;
    variant?: 'complement1' | 'complement2' | 'complement3';
    size?: 'small' | 'large';
    hideInfoCircle?: boolean;
}

function ProgressLine(props: Props) {
    const {
        className,
        progressClassName,
        progress,
        title,
        variant = 'complement1',
        size = 'small',
        hideInfoCircle = false,
    } = props;

    const progressWidth = `${bound(isDefined(progress) ? progress : 0, 0, 100)}%`;

    return (
        <div
            className={_cs(
                styles.progressBar,
                className,
                hideInfoCircle && styles.noCircle,
            )}
        >
            <div
                className={_cs(
                    styles.numberCircle,
                    variant === 'complement1' && styles.complement1,
                    variant === 'complement2' && styles.complement2,
                    variant === 'complement3' && styles.complement3,
                )}
            >
                <NumberOutput
                    value={progress}
                    precision={0}
                    suffix="%"
                />
            </div>
            <div className={styles.right}>
                <div>
                    {title}
                </div>
                <div
                    className={_cs(
                        styles.line,
                        size === 'small' && styles.small,
                        size === 'large' && styles.large,
                    )}
                >
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
