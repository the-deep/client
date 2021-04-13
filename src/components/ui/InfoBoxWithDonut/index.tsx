import React from 'react';
import { _cs } from '@togglecorp/fujs';
import CircularProgressBar from '#rsu/../v2/View/CircularProgressBar';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    // iconContainerClassName?: string;
    // valueClassName?: string;
    // labelClassName?: string;
    image?: string;
    label: string;
    percent?: number;
    variant?: 'accent' | 'complement';
}

function InfoBoxWithDonut(props: ComponentProps) {
    const {
        className,
        percent = 0,
        label,
        image,
        variant = 'accent',
    } = props;

    return (
        <div className={_cs(className, styles.infoBoxWithDonut)}>
            <CircularProgressBar
                className={styles.chart}
                arcClassName={styles[variant]}
                width={60}
                arcWidth={5}
                value={percent}
                imagePadding={10}
                src={image}
            />
            <div className={styles.content}>
                <span className={_cs(styles.value, styles[variant])}>
                    <Numeral
                        value={percent}
                        precision={2}
                        suffix="%"
                    />
                </span>
                <span className={styles.label}>
                    {label}
                </span>
            </div>
        </div>
    );
}

export default InfoBoxWithDonut;
