import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.css';

interface Props {
    className?: string;
}

function PublicReportView(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.publicReportView)}>
            Public Report View
        </div>
    );
}

export default PublicReportView;
