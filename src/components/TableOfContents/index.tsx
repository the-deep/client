import React, { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rsu/../v2/View/ListView';

import styles from './styles.css';

interface Props<T>{
    keySelector: (datum: T) => string | number;
    labelSelector: (datum: T) => string | number;
    childrenSelector: (datum: T) => T[] | undefined;
    onChange: (key: string | number) => void;
    options: T[];
    value: string | number | undefined;
}


type ToCListProps<T> = Omit<Props<T>, 'options'> & {
    options: T[];
    level: number;
};

type ToCItemProps<T> = Omit<Props<T>, 'options'> & {
    options: T;
    level: number;
};

function ToCItem<T>(props: ToCItemProps<T>) {
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

    const handleClick = () => {
        onChange(id);
    };

    const [collapsed, setCollapsed] = useState<boolean>(false);

    const handleCollapseToggle = () => {
        setCollapsed(v => !v);
    };

    const getClassName = () => {
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
    };

    const isSelected = id === value;

    const levelClassName = getClassName();

    if (children) {
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

function ToCList<T>(props: ToCListProps<T>) {
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

function TableOfContents<T, K>(props: Props<T>) {
    return (
        <ToCList
            {...props}
            level={0}
        />
    );
}

export default TableOfContents;
