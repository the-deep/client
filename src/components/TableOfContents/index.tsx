import React, { useState, useCallback, useMemo } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rsu/../v2/View/ListView';

import styles from './styles.scss';

interface Props<T, K extends string | number>{
    keySelector: (datum: T) => K;
    labelSelector: (datum: T) => K;
    childrenSelector: (datum: T) => T[] | undefined;
    onChange: (key: K) => void;
    options: T[];
    value: K | undefined;
    level?: number;
    defaultCollapseLevel?: number;
}

type ToCItemProps<T, K extends string | number > = Omit<Props<T, K>, 'options'> & {
    option: T;
};

function ToCItem<T, K extends string | number>(props: ToCItemProps<T, K>) {
    const {
        option,
        level = 0,
        value,
        onChange,
        keySelector,
        labelSelector,
        childrenSelector,
        defaultCollapseLevel,
    } = props;

    const id = keySelector(option);
    const title = labelSelector(option);
    const children = childrenSelector(option);

    const handleClick = useCallback(
        () => onChange(id),
        [id, onChange],
    );

    const [collapsed, setCollapsed] = useState<boolean>(
        isDefined(defaultCollapseLevel) && level >= defaultCollapseLevel,
    );

    const handleCollapseToggle = useCallback(
        () => setCollapsed(v => !v),
        [],
    );

    const isSelected = id === value;

    if (children && children.length > 0) {
        return (
            <div>
                <div className={styles.container}>
                    <div
                        className={_cs(
                            styles.item,
                            isSelected && styles.selected,
                        )}
                        onClick={handleClick}
                        onKeyDown={handleClick}
                        role="button"
                        tabIndex={-1}
                    >
                        {title}
                    </div>
                    <PrimaryButton
                        className={_cs(styles.expandButton)}
                        onClick={handleCollapseToggle}
                        transparent
                        iconName={collapsed ? 'down' : 'up'}
                    />
                </div>
                {!collapsed && (
                    <TableOfContents
                        {...props}
                        options={children}
                        level={level + 1}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            className={_cs(styles.item, isSelected && styles.selected)}
            onClick={handleClick}
            onKeyDown={handleClick}
            role="button"
            tabIndex={-1}
        >
            {title}
        </div>
    );
}


type ToCListProps<T, K extends string | number> = Props<T, K>;

function TableOfContents<T, K extends string | number>(props: ToCListProps<T, K>) {
    const {
        options,
        keySelector,
        level = 0,
        ...otherProps
    } = props;

    const rendererParams = (_: string | number, v: T) => ({
        ...otherProps,
        option: v,
        level,
        keySelector,
    });

    return (
        <ListView
            className={styles.tocList}
            data={options}
            renderer={ToCItem}
            keySelector={keySelector}
            rendererParams={rendererParams}
        />
    );
}

export default TableOfContents;
