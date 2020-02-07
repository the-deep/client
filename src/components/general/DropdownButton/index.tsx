import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import styles from './styles.scss';

interface DropdownButtonProps {
    className?: string;
    title: string;
    disabled?: boolean;
    onClick?: () => void;
}

const DropdownButton = ({
    className,
    title,
    ...otherProps
}: DropdownButtonProps) => (
    <Button
        className={_cs(className, styles.dropdownButton)}
        transparent
        {...otherProps}
    >
        { title }
    </Button>
);

export default DropdownButton;
