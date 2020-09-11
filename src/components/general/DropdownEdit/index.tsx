import React, { useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#rsca/DropdownMenu';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';

import styles from './styles.scss';

interface Option {
    key: string | number | boolean;
    value: string;
}

interface DropdownItemProps {
    itemKey: string | number | boolean;
    label: string;
    onItemSelect: (optionKey: Option['key']) => void;
    isActive: boolean;
}

function DropdownItem(props: DropdownItemProps) {
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

interface Props {
    className?: string;
    currentSelection: number | string;
    options?: Option[];
    onItemSelect: (optionKey: Option['key']) => void;
}

const optionKeySelector = (d: Option) => d.key;
const optionLabelSelector = (d: Option) => d.value;

function DropdownEdit(props: Props) {
    const {
        className,
        onItemSelect,
        options,
        currentSelection,
        dropdownLeftComponent,
        dropdownIcon = 'edit',
    } = props;

    const [showDropdown, setShowDropdown] = useState(false);

    const handleDropdownChange = useCallback((value) => {
        setShowDropdown(value);
    }, [setShowDropdown]);

    const optionRendererParams = useCallback((key, data) => ({
        isActive: key === currentSelection,
        itemKey: key,
        label: optionLabelSelector(data),
        onItemSelect,
    }), [onItemSelect, currentSelection]);

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
        >
            <ListView
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
