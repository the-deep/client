import React from 'react';
// import PropTypes from 'prop-types';

import DateInput from '#rs/components/Input/DateInput';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class DateWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        // TODO: feature to set date to published date automatically
        return (
            <DateInput
                faramElementName="value"
                showLabel={false}
            />
        );
    }
}
