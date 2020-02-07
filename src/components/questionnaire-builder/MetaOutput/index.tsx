import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface MetaOutputProps {
    className?: string;
    titleClassName?: string;
    label: string;
    value?: string | number;
}

const MetaOutput = ({
    className,
    label,
    value,
    titleClassName,
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
                { value }
            </div>
        </div>
    );
};

export default MetaOutput;
