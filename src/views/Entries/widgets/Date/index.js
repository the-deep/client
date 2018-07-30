import React from 'react';
import PropTypes from 'prop-types';

import FormattedDate from '#rscv/FormattedDate';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    data: {},
};

export default class DateListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            data: {
                value,
            },
            className,
        } = this.props;

        return (
            <div className={className} >
                <FormattedDate
                    date={value}
                    mode="dd-MM-yyyy"
                />
            </div>
        );
    }
}
