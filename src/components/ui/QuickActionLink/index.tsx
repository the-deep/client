import React from 'react';
import { _cs } from '@togglecorp/fujs';

import ButtonLikeLink, { ButtonLikeLinkProps } from '../ButtonLikeLink';

import styles from './styles.scss';

type QuickActionProps = ButtonLikeLinkProps;

function QuickActionLink(props: QuickActionProps) {
    const {
        className,
        ...otherProps
    } = props;

    return (
        <ButtonLikeLink
            className={_cs(className, styles.quickActionLink)}
            childrenClassName={styles.children}
            variant="inverted"
            {...otherProps}
        />
    );
}

export default QuickActionLink;
