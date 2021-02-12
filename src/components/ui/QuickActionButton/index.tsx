import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button, { ButtonProps } from '../Button';

import styles from './styles.scss';

type RoundButtonProps<T extends string | number | undefined> = Omit<ButtonProps<T>, 'icons'>;

function QuickActionButton<T extends string | number | undefined>(props: RoundButtonProps<T>) {
    const {
        className,
        ...otherProps
    } = props;

    return (
        <Button
            className={_cs(className, styles.button, styles.roundButton)}
            childrenClassName={styles.children}
            variant="inverted"
            {...otherProps}
        />
    );
}

export default QuickActionButton;
