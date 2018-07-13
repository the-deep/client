import React from 'react';
import PropTypes from 'prop-types';

import _ts from '#ts';
import NumberMatrixListOutput from '#widgetComponents/NumberMatrixListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
    data: {},
};

const emptyObject = {};

const getOptions = (widget = {}) => {
    const { properties: { data = emptyObject } = {} } = widget;
    return data;
};

export default class NumberMatrixListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            widget,
            data: {
                value,
            },
        } = this.props;
        const options = getOptions(widget);

        return (
            <NumberMatrixListOutput
                options={options}
                value={value}
                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
            />
        );
    }
}
