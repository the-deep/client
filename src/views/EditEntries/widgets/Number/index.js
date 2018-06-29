import React from 'react';
// import PropTypes from 'prop-types';

import NumberInput from '#rs/components/Input/NumberInput';

import _ts from '#ts';

const propTypes = {
};

const defaultProps = {
};

// eslint-disable-next-line react/prefer-stateless-function
export default class NumberWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const separatorText = ' ';
        return (
            <NumberInput
                faramElementName="value"
                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
                showLabel={false}
                separator={separatorText}
            />
        );
    }
}
