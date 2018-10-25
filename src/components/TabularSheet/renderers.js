import PropTypes from 'prop-types';
import React from 'react';

import Numeral from '#rscv/Numeral';
import Button from '#rsca/Button';
import { iconNames } from '#constants';

import EditField from './EditField';

// eslint-disable-next-line css-modules/no-unused-class
import styles from './styles.scss';


const getSortIcon = sortOrder => ({
    asc: iconNames.sortAscending,
    dsc: iconNames.sortDescending,
})[sortOrder] || iconNames.sort;

export class Header extends React.PureComponent {
    static propTypes = {
        columnKey: PropTypes.string.isRequired,
        value: PropTypes.shape({}).isRequired,
        onSortClick: PropTypes.func.isRequired,
        sortOrder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        sortOrder: undefined,
    };

    handleSortClick = () => {
        this.props.onSortClick(this.props.columnKey);
    }

    handleChange = (value) => {
        this.props.onChange(this.props.columnKey, value);
    }

    render() {
        const {
            sortOrder,
            value,
        } = this.props;

        return (
            <div className={styles.header}>
                <Button
                    className={styles.title}
                    onClick={this.handleSortClick}
                    iconName={getSortIcon(sortOrder)}
                    transparent
                >
                    {value.title}
                </Button>
                <EditField
                    className={styles.edit}
                    onChange={this.handleChange}
                    iconName={iconNames.edit}
                    value={value}
                    transparent
                />
            </div>
        );
    }
}

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
