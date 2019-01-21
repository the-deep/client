import PropTypes from 'prop-types';
import React from 'react';
import Numeral from '#rscv/Numeral';

export default class NumberCell extends React.PureComponent {
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
