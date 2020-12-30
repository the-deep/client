import React, { useCallback } from 'react';

import {
    _cs,
    isTruthyString,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#rsca/Button';

import styles from './styles.scss';

export interface ChipProps {
    id: string;
    className?: string;
    label?: string;
    labelClassName?: string;
    icon?: string;
    iconClassName?: string;
    onClose: (id: string) => void;
}

function Chip(props: ChipProps) {
    const {
        id,
        icon,
        label,
        className,
        iconClassName,
        labelClassName,
        onClose,
    } = props;

    const handleClose = useCallback(() => {
        onClose(id);
    }, [onClose, id]);

    return (
        <div className={_cs(className, styles.chip)}>
            {isTruthyString(icon) &&
                <Icon
                    name={icon}
                    className={iconClassName}
                />
            }
            {isTruthyString(label) &&
                <div className={_cs(styles.label, labelClassName)}>
                    {label}
                </div>
            }
            <Button
                className={styles.closeButton}
                onClick={handleClose}
                iconName="close"
                transparent
            />
        </div>
    );
}

export default Chip;

