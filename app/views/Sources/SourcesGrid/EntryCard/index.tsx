import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Card,
    Heading,
    DateOutput,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    leadTitle?: string;
    leadCreatedOn?: string;
    excerpt?: string;
}

function EntyrCard(props: Props) {
    const {
        className,
        leadTitle,
        leadCreatedOn,
        excerpt,
    } = props;

    return (
        <Card
            className={_cs(styles.entryCard, className)}
        >
            <Heading>
                {leadTitle}
            </Heading>
            {leadCreatedOn && (
                <DateOutput
                    value={leadCreatedOn}
                />
            )}
            <div className={styles.excerpt}>
                {excerpt}
            </div>
        </Card>
    );
}

export default EntyrCard;
