import React, { useState, useCallback, ReactElement } from 'react';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';

import styles from './styles.scss';

interface Option<T extends string | number | boolean> {
    key: T;
    value: string;
}

interface DropdownItemProps<T extends string | number | boolean> {
    itemKey: T;
    label: string;
    onItemSelect: (optionKey: T) => void;
    isActive: boolean;
}

function DropdownItem<T extends string | number | boolean>(props: DropdownItemProps<T>) {
    const {
        itemKey,
        label,
        onItemSelect,
        isActive,
    } = props;

    const handleDropdownItemClick = useCallback(() => {
        onItemSelect(itemKey);
    }, [onItemSelect, itemKey]);

    return (
        <Button
            className={_cs(
                styles.item,
                isActive && styles.active,
            )}
            onClick={handleDropdownItemClick}
            disabled={isActive}
        >
            {label}
        </Button>
    );
}

interface Props<T extends string | number | boolean> {
    className?: string;
    currentSelection: T;
    options?: Option<T>[];
    onItemSelect: (optionKey: T) => void;
    dropdownLeftComponent: JSX.Element | ReactElement | null;
    dropdownIcon?: string;
    disabled?: boolean;
}

function DropdownEdit<T extends string | number | boolean>(props: Props<T>) {
    const {
        className,
        onItemSelect,
        options,
        currentSelection,
        dropdownLeftComponent,
        dropdownIcon = 'edit',
        disabled,
    } = props;

    const [showDropdown, setShowDropdown] = useState(false);

    const handleDropdownChange = useCallback((value) => {
        setShowDropdown(value);
    }, [setShowDropdown]);

    const optionKeySelector = useCallback(
        (d: Option<T>) => d.key,
        [],
    );
    const optionLabelSelector = useCallback(
        (d: Option<T>) => d.value,
        [],
    );

    const optionRendererParams = useCallback((key: T, data: Option<T>) => ({
        isActive: key === currentSelection,
        itemKey: key,
        label: optionLabelSelector(data),
        onItemSelect,
    }), [onItemSelect, currentSelection, optionLabelSelector]);

    return (
        <DropdownMenu
            className={_cs(
                styles.dropdown,
                className,
                showDropdown && styles.visible,
            )}
            leftComponent={dropdownLeftComponent}
            dropdownIcon={dropdownIcon}
            onDropdownVisibilityChange={handleDropdownChange}
            closeOnClick
            disabled={disabled}
        >
            <ListView<Option<T>, DropdownItemProps<T>, T>
                className={styles.items}
                data={options}
                keySelector={optionKeySelector}
                rendererParams={optionRendererParams}
                renderer={DropdownItem}
            />
        </DropdownMenu>
    );
}

export default DropdownEdit;
