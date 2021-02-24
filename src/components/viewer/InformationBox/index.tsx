import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Numeral from '#rscv/Numeral';

import styles from './styles.scss';

interface ComponentProps {
    className?: string;
    iconContainerClassName?: string;
    valueClassName?: string;
    labelClassName?: string;
    icon?: React.ReactNode;
    label: string;
    value?: number;
    variant: 'accent' | 'complement' | 'negativeAccent';
}

function InformationBox(props: ComponentProps) {
    const {
        className,
        icon,
        label,
        value = 0,
        valueClassName,
        labelClassName,
        iconContainerClassName,
        variant = 'accent',
        ...otherProps
    } = props;

    return (
        <div
            className={_cs(
                styles.informationBox,
                className,
                styles[variant],
            )}
        >
            <div className={_cs(styles.iconContainer, iconContainerClassName)}>
                {icon}
            </div>
            <div className={styles.rightContainer}>
                <Numeral
                    className={_cs(styles.value, valueClassName)}
                    value={value}
                    precision={0}
                    {...otherProps}
                />
                <div className={_cs(styles.label, labelClassName)}>
                    {label}
                </div>
            </div>
        </div>
    );
}

export default InformationBox;
