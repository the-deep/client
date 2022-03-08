import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import { joinList } from '#utils/common';

import styles from './styles.css';

interface Props<T> {
    className?: string;
    items?: T[] | undefined | null;
    labelSelector: (item: T) => string;
    keySelector: (item: T) => string;
    separator?: string;
}

// FIXME: may need to add key on the commas
function CommaSeparatedItems<T>(props: Props<T>) {
    const {
        items,
        className,
        labelSelector,
        keySelector,
        separator = ', ',
    } = props;

    const title = useMemo(() => (
        items?.map(labelSelector)?.join(separator) ?? undefined
    ), [items, labelSelector, separator]);

    const list = useMemo(() => items?.map((item) => (
        <span
            key={keySelector(item)}
            className={styles.item}
        >
            {labelSelector(item)}
        </span>
    )), [
        items,
        keySelector,
        labelSelector,
    ]);

    if (!list) {
        return null;
    }

    return (
        <span
            className={_cs(className, styles.items)}
            title={title}
        >
            {joinList(list, separator)}
        </span>
    );
}

export default CommaSeparatedItems;
