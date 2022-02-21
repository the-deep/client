import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark } from 'react-icons/io5';

import {
    Button,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props {
    className?: string;
    title: string;
    itemKey: string;
    disabled?: boolean;
    value: boolean;
    onTagClick: (key: string) => void;
    mappedCount?: number;
}

function CheckButton(props: Props) {
    const {
        className,
        title,
        itemKey,
        disabled,
        value,
        mappedCount = 0,
        onTagClick,
    } = props;

    return (
        <Button
            name={itemKey}
            disabled={disabled}
            className={_cs(
                className,
                styles.checkButton,
                value ? styles.selected : styles.notSelected,
            )}
            onClick={onTagClick}
            actions={mappedCount > 0 && <IoCheckmark />}
        >
            {title}
        </Button>
    );
}

export default CheckButton;
