import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import { joinList } from '#utils/common';

import styles from './styles.css';

interface Item {
    id: number;
    name: string;
}

interface Props {
    className?: string;
    items?: Item[];
}

// FIXME may need to add key on the commas
function CommaSeparateItems(props: Props) {
    const { items, className } = props;

    const title = useMemo(() => (
        items?.map((i) => i.name)?.join(', ') ?? undefined
    ), [items]);

    if (!items || items.length < 1) {
        return null;
    }

    const list = items.map((item: Item) => (
        <span
            key={item.id}
            className={styles.item}
        >
            {item.name}
        </span>
    ));

    return (
        <span
            className={_cs(className, styles.items)}
            title={title}
        >
            { joinList(list) }
        </span>
    );
}

export default CommaSeparateItems;
