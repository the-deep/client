import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { joinList } from '#utils/common';

import styles from './styles.scss';

interface Item {
    id: number;
    name: string;
}
interface Props {
    className?: string;
    items?: Item[];
}

function CommaSeparateItems(props: Props) {
    const { items, className } = props;
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
        <span className={_cs(className, styles.items)}>
            { joinList(list) }
        </span>
    );
}

export default CommaSeparateItems;
