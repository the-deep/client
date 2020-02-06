import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface MetaOutputProps {
    className?: string;
    label: string;
    value?: string | number;
}

const MetaOutput = ({
    className,
    label,
    value,
}: MetaOutputProps) => {
    if (!value) {
        return null;
    }

    return (
        <div
            className={_cs(styles.metaOutput, className)}
            title={label}
        >
            <div className={styles.name} >
                { value }
            </div>
        </div>
    );
};

export default MetaOutput;
