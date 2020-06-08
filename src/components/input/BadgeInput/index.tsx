import React, { useCallback } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { FaramInputElement } from '@togglecorp/faram';

import Button from '#rsca/Button';

import styles from './styles.scss';

interface Props {
    className: string;
    title?: string;
    onChange?: (title: string) => void;
}

function BadgeInput(props: Props) {
    const {
        title,
        onChange,
        className,
    } = props;

    const handleButtonClick = useCallback(() => {
        if (title && onChange) {
            onChange(title);
        }
    }, [title, onChange]);

    if (isNotDefined(title)) {
        return null;
    }

    return (
        <Button
            className={_cs(className, styles.badgeInput)}
            onClick={handleButtonClick}
        >
            {title}
        </Button>
    );
}

export default FaramInputElement(BadgeInput);
