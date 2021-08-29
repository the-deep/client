import React from 'react';
import { Card } from '@the-deep/deep-ui';

import ExcerptOutput from '#newComponents/viewer/ExcerptOutput';
import styles from './styles.scss';


interface EntriesItemProps {
    excerpt: string;
    entryType?: string;
}

function EntriesItem(props: EntriesItemProps) {
    const {
        excerpt,
        entryType,
    } = props;

    return (
        <>
            <Card className={styles.entriesCard}>
                {entryType &&
                    <ExcerptOutput
                        excerpt={excerpt}
                        entryType={entryType}
                    />
                }
            </Card>
        </>
    );
}
export default EntriesItem;
