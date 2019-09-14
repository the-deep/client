import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const LinkItem = ({
    className,
    link,
    title,
    closeModal,
}) => (
    <Link
        className={_cs(styles.title, className)}
        onClick={closeModal}
        to={link}
    >
        {title}
    </Link>
);

LinkItem.propTypes = {
    link: PropTypes.string,
    title: PropTypes.string,
    closeModal: PropTypes.func.isRequired,
    className: PropTypes.string,
};

LinkItem.defaultProps = {
    className: undefined,
    link: '',
    title: '',
};

export default LinkItem;
