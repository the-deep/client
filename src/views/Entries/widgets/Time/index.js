import React from 'react';
import PropTypes from 'prop-types';

import FormattedDate from '#rs/components/View/FormattedDate';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: {},
};

export default class TimeListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data: { value },
            className,
        } = this.props;

        // Create fake date, we are only interested in time
        const sophisticatedTime = value ? `1994-12-25 ${value}` : undefined;

        return (
            <div className={className} >
                <FormattedDate
                    date={sophisticatedTime}
                    mode="hh:mm"
                />
            </div>
        );
    }
}
