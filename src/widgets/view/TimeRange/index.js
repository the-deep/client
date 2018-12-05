import React from 'react';
import PropTypes from 'prop-types';

import TimeRangeOutput from '#widgetComponents/TimeRangeOutput';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

// eslint-disable-next-line react/prefer-stateless-function
export default class TimeRangeViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { className } = this.props;

        return (
            <TimeRangeOutput
                className={`${className} ${styles.timeRange}`}
                faramElementName="value"
            />
        );
    }
}
