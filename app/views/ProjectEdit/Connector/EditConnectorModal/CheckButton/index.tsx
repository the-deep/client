import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoImage,
    IoCheckbox,
    IoSquareOutline,
} from 'react-icons/io5';
import {
    RawButton,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface Props<N extends string | number | undefined> {
    className?: string;
    children: React.ReactNode;
    name: N;
    disabled?: boolean;
    value: boolean;
    onClick: (key: N) => void;
}

function CheckButton<N extends string | number | undefined>(props: Props<N>) {
    const {
        className,
        children,
        name,
        disabled,
        value,
        onClick,
    } = props;

    return (
        <RawButton
            name={name}
            disabled={disabled}
            className={_cs(
                className,
                styles.checkButton,
            )}
            onClick={onClick}
        >
            <div className={styles.top}>
                <IoImage className={styles.left} />
                {(value
                    ? <IoCheckbox className={styles.right} />
                    : <IoSquareOutline className={styles.right} />
                )}
            </div>
            <div className={styles.label}>
                {children}
            </div>
        </RawButton>
    );
}

export default CheckButton;
