import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Link } from '@the-deep/deep-ui';

import styles from './styles.css';

export interface Props {
    title?: string;
    link?: string;
    className?: string;
}

function OrganizationLink(props: Props) {
    const {
        className,
        link,
        title,
    } = props;

    if (!link) {
        return (
            <div>{title}</div>
        );
    }

    return (
        <Link
            className={_cs(styles.link, className)}
            actionsContainerClassName={styles.linkActions}
            to={link}
        >
            {title}
        </Link>
    );
}

export default OrganizationLink;
