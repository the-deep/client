import PropTypes from 'prop-types';
import React from 'react';
import Numeral from '#rscv/Numeral';
import FormattedDate from '#rscv/FormattedDate';


const cellPropTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
    options: PropTypes.shape({}),
};
const cellDefaultProps = {
    value: '',
    className: '',
    options: {},
};

// eslint-disable-next-line no-unused-vars
export const StringCell = ({ value, className, options }) => (
    <div className={className}>
        { value }
    </div>
);

StringCell.propTypes = cellPropTypes;
StringCell.defaultProps = cellDefaultProps;

const separators = {
    comma: ',',
    space: ' ',
    none: '',
};

export const NumberCell = ({ value, className, options: { separator = 'none' } }) => (
    <Numeral
        className={className}
        value={parseFloat(value)}
        precision={null}
        showSeparator={separator !== 'none'}
        separator={separators[separator]}
    />
);

NumberCell.propTypes = cellPropTypes;
NumberCell.defaultProps = cellDefaultProps;


// eslint-disable-next-line no-unused-vars
export const DateCell = ({ value, className, options }) => (
    <FormattedDate
        className={className}
        value={value}
    />
);

DateCell.propTypes = cellPropTypes;
DateCell.defaultProps = cellDefaultProps;
