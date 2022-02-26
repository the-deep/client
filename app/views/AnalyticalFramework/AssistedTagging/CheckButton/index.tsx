import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmark } from 'react-icons/io5';

import {
    Button,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props<N> {
    className?: string;
    children: React.ReactNode;
    name: N;
    disabled?: boolean;
    value: boolean;
    onClick: (key: N) => void;
    mappedCount?: number;
}

function CheckButton<N>(props: Props<N>) {
    const {
        className,
        children,
        name,
        disabled,
        value,
        mappedCount = 0,
        onClick,
    } = props;

    return (
        <Button
            name={name}
            disabled={disabled}
            className={_cs(
                className,
                styles.checkButton,
                value ? styles.selected : styles.notSelected,
            )}
            onClick={onClick}
            actions={mappedCount > 0 && <IoCheckmark />}
        >
            {children}
        </Button>
    );
}

export default CheckButton;
