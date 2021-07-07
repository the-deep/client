import React from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';

import HighlightableText from '#newComponents/viewer/HighlightableTextOutput';

import styles from './styles.scss';

interface MetaOutputProps {
    className?: string;
    titleClassName?: string;
    label: string;
    value?: string | number;
    searchValue?: string;
}

const MetaOutput = ({
    className,
    label,
    value,
    titleClassName,
    searchValue,
}: MetaOutputProps) => {
    if (isNotDefined(value)) {
        return null;
    }

    return (
        <div
            className={_cs(styles.metaOutput, className)}
            title={label}
        >
            <div className={_cs(styles.name, titleClassName)} >
                <HighlightableText
                    highlightText={searchValue}
                    text={String(value)}
                />
            </div>
        </div>
    );
};

export default MetaOutput;
