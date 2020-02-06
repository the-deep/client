import React from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

type ButtonType = 'default' | 'primary' | 'accent' | 'danger' | 'warning'

interface Props {
    className?: string;
    type: ButtonType;
}

const styleTypeMap: {
    [key in ButtonType]: string;
} = {
    default: styles.default,
    primary: styles.primary,
    accent: styles.accent,
    danger: styles.danger,
    warning: styles.warning,
};

const ButtonLikeLink = (props: Props) => {
    const {
        className,
        type,
        ...otherProps
    } = props;

    return (
        <Link
            className={_cs(
                className,
                styles.buttonLikeLink,
                styleTypeMap[type],
            )}
            {...otherProps}
        />
    );
};
ButtonLikeLink.defaultProps = {
    type: 'default',
};

export default ButtonLikeLink;
