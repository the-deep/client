import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { DraggableContent } from '@the-deep/deep-ui';

import EntryItem, { Props as EntryItemProps } from '../EntryItem';
import styles from './styles.scss';

interface Props extends EntryItemProps {
    className?: string;
    entryId: number;
    disabled?: boolean;
}

function SourceEntryItem(props: Props) {
    const {
        className,
        entryId,
        disabled,
        ...otherProps
    } = props;

    const value = useMemo(() => ({ entryId }), [entryId]);

    return (
        <DraggableContent
            className={_cs(className, styles.entryItem, disabled && styles.disabled)}
            name="entry"
            value={value}
        >
            <EntryItem
                {...otherProps}
            />
        </DraggableContent>
    );
}

export default SourceEntryItem;
