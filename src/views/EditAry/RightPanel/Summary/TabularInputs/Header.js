import React from 'react';
import PropTypes from 'prop-types';

const Header = ({ title, className }) => (
    <th className={className}>
        {title}
    </th>
);
Header.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
};
Header.defaultProps = {
    className: '',
};

export default Header;
