import React from 'react';
import styles from './styles.css';

interface Props {
    displayName?: string | null | undefined;
    emailDisplay: string;
}

function OptionLabelSelector(props: Props) {
    const {
        displayName,
        emailDisplay,
    } = props;

    return (
        <div className={styles.option}>
            <div className={styles.displayName}>
                {displayName ?? ''}
            </div>
            <div className={styles.email}>
                {emailDisplay}
            </div>
        </div>
    );
}

export default OptionLabelSelector;
