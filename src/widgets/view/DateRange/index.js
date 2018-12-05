import React from 'react';
import PropTypes from 'prop-types';

import DateRangeOutput from '#widgetComponents/DateRangeOutput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};


// eslint-disable-next-line react/prefer-stateless-function
export default class DateRangeViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { className } = this.props;

        return (
            <DateRangeOutput
                className={`${className} ${styles.dateRange}`}
                faramElementName="value"
            />
        );
    }
}
