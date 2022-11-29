import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function EntriesContent(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.entriesContent)}>
            Entries Content
        </div>
    );
}

export default EntriesContent;
