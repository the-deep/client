import React from 'react';
import { _cs } from '@togglecorp/fujs';

import SourceDetails, { Entry } from './SourceDetails';
import styles from './styles.scss';

interface Props {
    className?: string;
}

function PrimaryTagging(props: Props) {
    const {
        className,
    } = props;

    const [entries, setEntries] = React.useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = React.useState<Entry['clientId'] | undefined>();

    const handleEntryCreate = React.useCallback((newEntry: Entry) => {
        setEntries(oldEntries => ([
            ...oldEntries,
            newEntry,
        ]));
    }, [setEntries]);

    return (
        <div className={_cs(className, styles.primaryTagging)}>
            <SourceDetails
                className={styles.sourcePreview}
                onEntryCreate={handleEntryCreate}
                entries={entries}
                activeEntry={activeEntry}
                onEntryClick={setActiveEntry}
            />
            <div className={styles.taggingPlayground}>
                Tagging playground
            </div>
        </div>
    );
}

export default PrimaryTagging;
