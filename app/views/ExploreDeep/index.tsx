import React from 'react';
import { _cs } from '@togglecorp/fujs';

import PageContent from '#components/PageContent';

import styles from './styles.css';

interface Props {
    className?: string;
}

function ExploreDeep(props: Props) {
    const {
        className,
    } = props;

    return (
        <PageContent className={_cs(styles.exploreDeep, className)}>
            Explore Deep
        </PageContent>
    );
}

export default ExploreDeep;
