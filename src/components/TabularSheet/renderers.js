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
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
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
            title,
            type,
        } = this.props;

        return (
            <div className={styles.header}>
                <Button
                    className={styles.title}
                    onClick={this.handleSortClick}
                    iconName={getSortIcon(sortOrder)}
                    transparent
                >
                    {title}
                </Button>
                <EditField
                    className={styles.edit}
                    onChange={this.handleChange}
                    iconName={iconNames.edit}
                    title={title}
                    type={type}
                    transparent
                />
            </div>
        );
    }
}

const cellPropTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
};
const cellDefaultProps = {
    value: '',
    className: '',
};

export const StringCell = ({ value, className }) => (
    <div className={className}>
        { value }
    </div>
);

StringCell.propTypes = cellPropTypes;
StringCell.defaultProps = cellDefaultProps;

export const NumberCell = ({ value, className }) => (
    <Numeral
        className={className}
        value={parseFloat(value)}
    />
);

NumberCell.propTypes = cellPropTypes;
NumberCell.defaultProps = cellDefaultProps;
