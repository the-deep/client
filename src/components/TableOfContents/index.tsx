import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import ListView from '#rsu/../v2/View/ListView';
import Message from '#rscv/Message';
import Badge from '#components/viewer/Badge';
import _ts from '#ts';
import { hasKey } from '#utils/common';

import styles from './styles.scss';

const noOp = () => {
    // no operation
};

interface Props<T, K extends string | number>{
    idSelector: (datum: T) => K;
    keySelector: (datum: T) => K | undefined;
    labelSelector: (datum: T) => K;
    verifiedCountSelector: (datum: T) => number | undefined;
    unverifiedCountSelector: (datum: T) => number | undefined;
    childrenSelector: (datum: T) => T[] | undefined;
    onChange: (value: T[]) => void;
    options: T[];
    value: T[];
    searchValue?: string;
    level?: number;
    defaultCollapseLevel?: number;
    className?: string;
    multiple?: boolean;
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
        verifiedCountSelector,
        unverifiedCountSelector,
        multiple = false,
        searchValue,
    } = props;

    const key = keySelector(option);
    const id = idSelector(option);
    const title = labelSelector(option);
    const children = childrenSelector(option);
    const verifiedCount = verifiedCountSelector(option);
    const unverifiedCount = unverifiedCountSelector(option);

    const tocElementRef = useRef<HTMLDivElement>(null);

    const isParent = useMemo(() =>
        hasKey(option, searchValue, idSelector, childrenSelector),
    [option, searchValue, idSelector, childrenSelector]);

    const handleClick = useCallback(
        () => {
            if (isNotDefined(key)) {
                return;
            }
            const isSelected = value.some(s => idSelector(s) === idSelector(option));
            if (isSelected) {
                if (multiple) {
                    const newSelection = value.filter(s => idSelector(s) !== idSelector(option));
                    onChange(newSelection);
                } else {
                    onChange([]);
                }
            } else {
                onChange(multiple ? [...value, option] : [option]);
            }
        },
        [onChange, key, option, multiple, idSelector, value],
    );

    const [collapsed, setCollapsed] = useState<boolean>(
        isDefined(defaultCollapseLevel) && level >= defaultCollapseLevel,
    );

    useEffect(() => {
        const isCollapsed = isDefined(defaultCollapseLevel) && level >= defaultCollapseLevel;
        setCollapsed(isCollapsed);
    }, [level, defaultCollapseLevel]);

    const handleCollapseToggle = useCallback(
        () => setCollapsed(v => !v),
        [],
    );

    const isSelected = useMemo(() => (
        value.some(v => idSelector(v) === id)
    ), [value, idSelector, id]);

    const totalEntries = useMemo(() => (
        (verifiedCount ?? 0) + (unverifiedCount ?? 0)
    ), [verifiedCount, unverifiedCount]);

    const isIdSearched = id === searchValue;

    useEffect(() => {
        if (isParent) {
            setCollapsed(false);
        }
        if (isIdSearched) {
            tocElementRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isParent, isIdSearched]);

    return (
        <div
            className={_cs(
                className,
                styles.tocItem,
                isIdSearched && styles.searched,
                isSelected && styles.active,
            )}
            ref={tocElementRef}
        >
            <div className={styles.header}>
                <div
                    className={styles.heading}
                    onClick={handleClick}
                    onKeyDown={noOp}
                    role="button"
                    tabIndex={0}
                >
                    <div className={styles.title}>{title}</div>
                    {totalEntries > 0 && (
                        <Badge
                            className={styles.count}
                            title={`${verifiedCount ?? 0} of ${totalEntries}`}
                            tooltip={_ts(
                                'entries.qualityControl',
                                'verifiedCountTooltip',
                                {
                                    verified: verifiedCount ?? 0,
                                    total: totalEntries,
                                },
                            )}
                            titleClassName={styles.title}
                        />
                    )}
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
        options,
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
