import PropTypes from 'prop-types';
import React from 'react';
import FormattedDate from '#rscv/FormattedDate';


export default class DateCell extends React.PureComponent {
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
