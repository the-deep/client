import React from 'react';
import PropTypes from 'prop-types';

import StringCell from './StringCell';

// eslint-disable-next-line import/prefer-default-export
export const handleInvalidCell = (Cell) => {
    const WrappedCell = ({ invalid, ...otherProps }) => (
        invalid
            ? <StringCell invalid={invalid} {...otherProps} />
            : <Cell {...otherProps} />
    );
    WrappedCell.propTypes = {
        invalid: PropTypes.bool,
    };
    WrappedCell.defaultProps = {
        invalid: false,
    };
    return WrappedCell;
};
