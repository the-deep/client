import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    NumberOutput,
    InformationCardFragments,
} from '@the-deep/deep-ui';

import { genericMemo } from '#utils/common';

import styles from './styles.css';

type InformationVariant = 'accent' | 'complement1' | 'complement2' | 'complement3';

export interface Props {
    className?: string;
    icon?: React.ReactNode;
    label: string;
    totalValue?: number | null;
    filteredValue?: number;
    variant: InformationVariant;
    valuePrecision?: number;
    coloredBackground?: boolean;
    emptyContent?: React.ReactNode;
    isFiltered?: boolean;
}

const styleMap: {
    [key in InformationVariant]: string;
} = {
    accent: styles.accent,
    complement1: styles.complement1,
    complement2: styles.complement2,
    complement3: styles.complement3,
};

function InformationCard(props: Props) {
    const {
        className,
        icon,
        label,
        totalValue,
        filteredValue,
        variant = 'accent',
        valuePrecision = 0,
        coloredBackground,
        emptyContent = 0,
        isFiltered,
    } = props;

    return (
        <div
            className={_cs(
                styles.informationCard,
                className,
                coloredBackground && styles.coloredBackground,
                styleMap[variant],
            )}
        >
            <InformationCardFragments
                variant={variant}
                coloredBackground={coloredBackground}
                icon={icon}
                value={(
                    <div className={styles.numbers}>
                        {isFiltered && (
                            <NumberOutput
                                className={styles.filteredNumber}
                                value={filteredValue}
                                invalidText={null}
                                precision={valuePrecision}
                            />
                        )}
                        <NumberOutput
                            value={totalValue}
                            invalidText={emptyContent}
                            precision={valuePrecision}
                        />
                    </div>
                )}
                label={label}
                labelContainerClassName={styles.labelContainer}
            />
        </div>
    );
}

export default genericMemo(InformationCard);
