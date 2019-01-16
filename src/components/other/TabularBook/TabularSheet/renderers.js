import PropTypes from 'prop-types';
import React from 'react';
import Numeral from '#rscv/Numeral';
import FormattedDate from '#rscv/FormattedDate';

import _cs from '#cs';
import styles from './styles.scss';


export class StringCell extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string,
        className: PropTypes.string,
        invalid: PropTypes.bool,
    };

    static defaultProps = {
        value: '',
        className: '',
        invalid: false,
    };

    render() {
        const { value, className, invalid } = this.props;
        return (
            <div className={_cs(className, invalid && styles.invalid)}>
                { value }
            </div>
        );
    }
}

// eslint-disable-next-line react/no-multi-comp
export class NumberCell extends React.PureComponent {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        className: PropTypes.string,
        options: PropTypes.shape({}),
    };

    static defaultProps = {
        value: '',
        className: '',
        options: {},
    };

    static separators = {
        comma: ',',
        space: ' ',
        none: '',
    };

    render() {
        const {
            value,
            className,
            options: {
                separator = 'none',
            },
        } = this.props;

        return (
            <Numeral
                className={className}
                value={parseFloat(value)}
                precision={null}
                showSeparator={separator !== 'none'}
                separator={NumberCell.separators[separator]}
            />
        );
    }
}

// eslint-disable-next-line react/no-multi-comp
export class DateCell extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string,
        className: PropTypes.string,
    };

    static defaultProps = {
        value: '',
        className: '',
    };

    render() {
        const { value, className } = this.props;

        return (
            <FormattedDate
                className={className}
                value={value}
            />
        );
    }
}

// HOC
export const handleInvalid = Cell => ({ invalid, ...otherProps }) => (
    invalid ? <StringCell {...otherProps} /> : <Cell {...otherProps} />
);
