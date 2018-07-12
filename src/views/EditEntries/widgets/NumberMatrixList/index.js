import React from 'react';
import PropTypes from 'prop-types';

import _ts from '#ts';
import NumberMatrixOutput from './NumberMatrixOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const emptyObject = {};

const getData = (widget = {}) => {
    const { properties: { data = emptyObject } = {} } = widget;
    return data;
};

export default class NumberMatrixListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const data = getData(widget);

        return (
            <NumberMatrixOutput
                data={data}
                faramElementName="value"
                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
            />
        );
    }
}
