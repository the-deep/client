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
    titleClassName?: string;
    progress?: number;
    variant?: 'complement1' | 'complement2' | 'complement3' | 'accent';
    size?: 'small' | 'large';
    hideInfoCircle?: boolean;
    hideInfoCircleBackground?: boolean;
}

function ProgressLine(props: Props) {
    const {
        className,
        progressClassName,
        titleClassName,
        progress,
        title,
        variant = 'complement1',
        size = 'small',
        hideInfoCircle = false,
        hideInfoCircleBackground = false,
    } = props;

    const progressWidth = `${bound(isDefined(progress) ? progress : 0, 0, 100)}%`;

    return (
        <div
            className={_cs(
                styles.progressBar,
                className,
                hideInfoCircleBackground && styles.noCircle,
            )}
        >
            {!hideInfoCircle && (
                <div
                    className={_cs(
                        styles.numberCircle,
                        variant === 'complement1' && styles.complement1,
                        variant === 'complement2' && styles.complement2,
                        variant === 'complement3' && styles.complement3,
                        variant === 'accent' && styles.accent,
                    )}
                >
                    <NumberOutput
                        value={progress}
                        precision={0}
                        suffix="%"
                    />
                </div>
            )}
            <div className={styles.right}>
                <div className={titleClassName}>
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
