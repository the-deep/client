import React from 'react';

import styles from './styles.scss';

interface MetaOutputProps {
    label: string;
    value?: string | number;
}

const MetaOutput = ({
    label,
    value,
}: MetaOutputProps) => {
    if (!value) {
        return null;
    }

    return (
        <div
            className={styles.metaOutput}
            title={label}
        >
            <div
                className={styles.name}
            >
                { value }
            </div>
        </div>
    );
};

export default MetaOutput;
