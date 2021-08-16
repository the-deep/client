import React from 'react';
import { Entry } from '#types/newEntry';

interface Props {
    entry: Entry;
}
function EntryItem(props: Props) {
    const {
        entry,
    } = props;

    return (
        <div>{entry.id}</div>
    );
}

export default EntryItem;
