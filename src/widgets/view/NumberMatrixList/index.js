import React from 'react';
import PropTypes from 'prop-types';

import _ts from '#ts';
import NumberMatrixListOutput from '#widgetComponents/NumberMatrixListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    widget: undefined,
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
            className,
        } = this.props;
        const options = getOptions(widget);

        return (
            <NumberMatrixListOutput
                faramElementName="value"
                className={className}
                options={options}
                placeholder={_ts('widgets.view.numberMatrix', 'numberPlaceholder')}
            />
        );
    }
}
