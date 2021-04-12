import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

export type InformationVariant = 'accent'
    | 'complement1'
    | 'complement2'
    | 'complement3';

export interface Props {
    icon: React.ReactNode;
    value: React.ReactNode;
    label: React.ReactNode;
    iconContainerClassName?: string;
    valueAndLabelContainerClassName?: string;
    valueContainerClassName?: string;
    labelContainerClassName?: string;
    variant?: InformationVariant;
    coloredBackground?: boolean;
}

const styleMap: {
    [key in InformationVariant]: string;
} = {
    accent: styles.accent,
    complement1: styles.complement1,
    complement2: styles.complement2,
    complement3: styles.complement3,
};

function InformationCardFragments(props: Props) {
    const {
        icon,
        value,
        label,
        iconContainerClassName,
        valueAndLabelContainerClassName,
        valueContainerClassName,
        labelContainerClassName,
        coloredBackground,
        variant = 'accent',
    } = props;

    return (
        <>
            { icon && (
                <div
                    className={_cs(
                        styles.iconContainer,
                        iconContainerClassName,
                        coloredBackground && styles.coloredBackground,
                        styleMap[variant],
                    )}
                >
                    { icon }
                </div>
            )}
            <div
                className={_cs(
                    styles.valueAndLabelContainer,
                    valueAndLabelContainerClassName,
                    coloredBackground && styles.coloredBackground,
                    styleMap[variant],
                )}
            >
                <div className={_cs(styles.value, valueContainerClassName)}>
                    { value }
                </div>
                <div className={_cs(styles.label, labelContainerClassName)}>
                    { label }
                </div>
            </div>
        </>
    );
}

export default InformationCardFragments;
