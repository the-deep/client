import React from 'react';
import { _cs } from '@togglecorp/fujs';

import HighlightableText from '#components/viewer/HighlightableTextOutput';

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
    if (!value) {
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
                    text={value}
                />
            </div>
        </div>
    );
};

export default MetaOutput;
