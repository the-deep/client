import React from 'react';
import PropTypes from 'prop-types';

import _ts from '#ts';
import NumberMatrixListOutput from '#widgetComponents/NumberMatrixListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
};

const emptyObject = {};

const getOptions = (widget) => {
    const { properties: { data = emptyObject } = {} } = widget;
    return data;
};

export default class NumberMatrixListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <NumberMatrixListOutput
                options={options}
                faramElementName="value"
                placeholder={_ts('widgets.tagging.numberMatrix', 'numberPlaceholder')}
            />
        );
    }
}
