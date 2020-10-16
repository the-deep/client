import React, { useState, useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rsu/../v2/View/ListView';

import styles from './styles.scss';

interface Props<T, K extends string | number>{
    idSelector: (datum: T) => K;
    keySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => K;
    childrenSelector: (datum: T) => T[] | undefined;
    onChange: (value: { key: K; id: K }) => void;
    options: T[];
    value: {key: K; id: K } | undefined;
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
        idSelector,
        childrenSelector,
        defaultCollapseLevel,
    } = props;

    const key = keySelector(option);
    const id = idSelector(option);
    const title = labelSelector(option);
    const children = childrenSelector(option);

    const handleClick = useCallback(
        () => {
            if (isDefined(key)) {
                return onChange({ key, id });
            }
            return undefined;
        },
        [key, id, onChange],
    );

    const [collapsed, setCollapsed] = useState<boolean>(
        isDefined(defaultCollapseLevel) && level >= defaultCollapseLevel,
    );

    const handleCollapseToggle = useCallback(
        () => setCollapsed(v => !v),
        [],
    );

    const isSelected = id === value?.id;

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
        idSelector,
        level = 0,
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
            className={styles.tocList}
            data={options}
            renderer={ToCItem}
            keySelector={idSelector}
            rendererParams={rendererParams}
        />
    );
}

export default TableOfContents;
