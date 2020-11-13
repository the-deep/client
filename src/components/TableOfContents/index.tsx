import React, { useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import Button from '#rsca/Button';
import ListView from '#rsu/../v2/View/ListView';
import Message from '#rscv/Message';
import _ts from '#ts';

import styles from './styles.scss';

const noOp = () => {};

interface Props<T, K extends string | number>{
    idSelector: (datum: T) => K;
    keySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => K;
    childrenSelector: (datum: T) => T[] | undefined;
    onChange: (value: T) => void;
    options: T[];
    value: T[];
    level?: number;
    defaultCollapseLevel?: number;
    className?: string;
}

type ToCItemProps<T, K extends string | number > = Omit<Props<T, K>, 'options'> & {
    option: T;
};

function EmptyComponent() {
    return (
        <Message>
            {_ts('entries.qualityControl', 'tableOfContentEmpty')}
        </Message>
    );
}

function ToCItem<T, K extends string | number>(props: ToCItemProps<T, K>) {
    const {
        option,
        level = 0,
        value,
        onChange,
        keySelector,
        labelSelector,
        idSelector,
        childrenSelector,
        defaultCollapseLevel,
        className,
    } = props;

    const key = keySelector(option);
    const id = idSelector(option);
    const title = labelSelector(option);
    const children = childrenSelector(option);

    const handleClick = useCallback(
        () => {
            if (isDefined(key)) {
                onChange(option);
            }
        },
        [onChange, key, option],
    );

    const [collapsed, setCollapsed] = useState<boolean>(
        isDefined(defaultCollapseLevel) && level >= defaultCollapseLevel,
    );

    const handleCollapseToggle = useCallback(
        () => setCollapsed(v => !v),
        [],
    );

    const isSelected = value.some(v => idSelector(v) === id);

    return (
        <div className={_cs(
            className,
            styles.tocItem,
            isSelected && styles.active,
            !collapsed && styles.expanded,
        )}
        >
            <div className={styles.header}>
                <div
                    className={styles.heading}
                    onClick={handleClick}
                    onKeyDown={noOp}
                    role="button"
                    tabIndex={0}
                >
                    {title}
                </div>
                { children && children.length > 0 && (
                    <div className={styles.actions}>
                        <Button
                            className={styles.expandButton}
                            onClick={handleCollapseToggle}
                            transparent
                            iconName={collapsed ? 'chevronDown' : 'chevronUp'}
                        />
                    </div>
                )}
            </div>
            {children && children.length > 0 && !collapsed && (
                <TableOfContents
                    {...props}
                    className={_cs(props.className, styles.children)}
                    options={children}
                    level={level + 1}
                />
            )}
        </div>
    );
}


type ToCListProps<T, K extends string | number> = Props<T, K>;

function TableOfContents<T, K extends string | number>(props: ToCListProps<T, K>) {
    const {
        options,
        idSelector,
        level = 0,
        className,
        ...otherProps
    } = props;

    const rendererParams = (_: string | number, v: T) => ({
        ...otherProps,
        option: v,
        level,
        idSelector,
    });

    return (
        <ListView
            className={_cs(className, styles.tableOfContents)}
            data={options}
            renderer={ToCItem}
            keySelector={idSelector}
            rendererParams={rendererParams}
            emptyComponent={EmptyComponent}
        />
    );
}

export default TableOfContents;
