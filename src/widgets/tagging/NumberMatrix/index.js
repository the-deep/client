import React from 'react';
import PropTypes from 'prop-types';

import _ts from '#ts';

import NumberMatrixInput from '#widgetComponents/NumberMatrixInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    widget: undefined,
};

const emptyObject = {};

const getData = (widget) => {
    const { properties: { data = emptyObject } = {} } = widget;
    return data;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class NumberMatrixOverviewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const data = getData(widget);

        return (
            <NumberMatrixInput
                data={data}
                faramElementName="value"
                placeholder={_ts('widgets.tagging.numberMatrix', 'numberPlaceholder')}
            />
        );
    }
}
