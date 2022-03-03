import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoCheckmark,
    IoSquareOutline,
} from 'react-icons/io5';

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
}

function CheckButton<N>(props: Props<N>) {
    const {
        className,
        children,
        name,
        disabled,
        value,
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
            variant="tertiary"
            actions={value ? <IoCheckmark /> : <IoSquareOutline />}
        >
            {children}
        </Button>
    );
}

export default CheckButton;
