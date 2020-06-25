import React from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

interface Props {
    className?: string;
    title: string;
    link: string;
}

function EntityLink(props: Props) {
    const {
        className,
        title,
        link,
    } = props;

    return (
        <Link
            className={_cs(className, styles.link)}
            to={link}
        >
            {title}
        </Link>
    );
}

export default EntityLink;
