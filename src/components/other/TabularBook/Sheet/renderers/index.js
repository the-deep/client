import React from 'react';
import PropTypes from 'prop-types';

import StringCell from './StringCell';

// eslint-disable-next-line import/prefer-default-export
export const handleInvalidCell = (Cell) => {
    const WrappedCell = ({ invalid, empty, ...otherProps }) => (
        invalid || empty
            ? <StringCell invalid={invalid} empty={empty} {...otherProps} />
            : <Cell {...otherProps} />
    );
    WrappedCell.propTypes = {
        invalid: PropTypes.bool,
        empty: PropTypes.bool,
    };
    WrappedCell.defaultProps = {
        invalid: false,
        empty: false,
    };
    return WrappedCell;
};
