import React, { useCallback } from 'react';
import {
    _cs,
    isNotDefined,
    isDefined,
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
        if (isDefined(title) && isDefined(onChange)) {
            onChange(title);
        }
    }, [title, onChange]);

    if (isNotDefined(title)) {
        return null;
    }

    const tooltip = `Click to apply: ${title}`;

    return (
        <Button
            className={_cs(className, styles.badgeInput)}
            title={tooltip}
            onClick={handleButtonClick}
        >
            {title}
        </Button>
    );
}

export default FaramInputElement(BadgeInput);
