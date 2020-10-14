import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

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
}


type ToCListProps<T, K extends string | number> = Omit<Props<T, K>, 'options'> & {
    options: T[];
    level: number;
};

type ToCItemProps<T, K extends string | number > = Omit<Props<T, K>, 'options'> & {
    options: T;
    level: number;
};

function ToCItem<T, K extends string | number>(props: ToCItemProps<T, K>) {
    const {
        options,
        level,
        value,
        onChange,
        keySelector,
        labelSelector,
        childrenSelector,
    } = props;

    const id = keySelector(options);
    const title = labelSelector(options);
    const children = childrenSelector(options);

    const handleClick = useCallback(
        () => onChange(id),
        [id, onChange],
    );

    const [collapsed, setCollapsed] = useState<boolean>(false);

    const handleCollapseToggle = useCallback(
        () => setCollapsed(v => !v),
        [],
    );

    const levelClassName = useMemo(() => {
        switch (level) {
            case 0: {
                return styles.levelZero;
            }
            case 1: {
                return styles.levelOne;
            }
            case 2: {
                return styles.levelTwo;
            }
            case 3: {
                return styles.levelThree;
            }
            default: {
                return styles.leaf;
            }
        }
    }, [level]);

    const isSelected = id === value;

    if (children && children.length > 0) {
        return (
            <div>
                <div className={styles.container}>
                    <div
                        className={_cs(
                            styles.item,
                            levelClassName,
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
                {
                    !collapsed && (
                        <ToCList
                            {...props}
                            options={children}
                            level={level + 1}
                        />
                    )
                }
            </div>
        );
    }
    return (
        <div
            className={_cs(styles.item, isSelected && styles.selected, levelClassName)}
            onClick={handleClick}
            onKeyDown={handleClick}
            role="button"
            tabIndex={-1}
        >
            {title}
        </div>
    );
}

function ToCList<T, K extends string | number>(props: ToCListProps<T, K>) {
    const { options, keySelector, ...otherProps } = props;

    const rendererParams = (_: string | number, v: T) => ({
        options: v,
        ...otherProps,
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

function TableOfContents<T, K extends string | number>(props: Props<T, K>) {
    return (
        <ToCList
            {...props}
            level={0}
        />
    );
}

export default TableOfContents;
