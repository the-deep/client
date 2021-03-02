import React, { ReactNode } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

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
        <span key={item.id} className={styles.item}>{item.name}</span>
    ));

    const out: ReactNode[] = [];
    list.forEach((item, i) => {
        if (list.length > 1 && i === list.length - 1) {
            out.push(' and ');
        }
        out.push(item);
        if (list.length > 2 && i < list.length - 2) out.push(', ');
    });
    return <span className={_cs(className, styles.items)}>{out}</span>;
}

export default CommaSeparateItems;
