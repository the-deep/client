import PropTypes from 'prop-types';
import React from 'react';
import Numeral from '#rscv/Numeral';
import FormattedDate from '#rscv/FormattedDate';

import _cs from '#cs';
import styles from './styles.scss';


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
export const StringCell = ({ value, className, options: { invalid = false } }) => (
    <div className={_cs(className, invalid ? styles.invalid : '')}>
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

export const NumberCell = ({ value, className, options: { separator = 'none', invalid = false } }) => (
    <Numeral
        className={_cs(className, invalid ? styles.invalid : '')}
        value={invalid ? value : parseFloat(value)}
        precision={null}
        showSeparator={separator !== 'none'}
        separator={separators[separator]}
    />
);

NumberCell.propTypes = cellPropTypes;
NumberCell.defaultProps = cellDefaultProps;


// eslint-disable-next-line no-unused-vars
export const DateCell = ({ value, className, options: { invalid = false } }) => (
    <FormattedDate
        className={_cs(className, invalid ? styles.invalid : '')}
        value={value}
    />
);

DateCell.propTypes = cellPropTypes;
DateCell.defaultProps = cellDefaultProps;
