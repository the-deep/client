import React from 'react';
import { _cs } from '@togglecorp/fujs';

import PageContent from '#components/PageContent';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Analysis(props: Props) {
    const {
        className,
    } = props;

    return (
        <PageContent className={_cs(styles.analysis, className)}>
            Analysis
        </PageContent>
    );
}

export default Analysis;
