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

const getData = (widget = {}) => {
    const { properties: { data } = {} } = widget;
    return data;
};

export default class NumberMatrixListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { widget } = this.props;
        this.data = getData(widget);
    }

    componentWillRecieveProps(nextProps) {
        const { widget: newWidget } = nextProps;
        const { widget: oldWidget } = this.props;

        const newData = getData(newWidget);
        const oldData = getData(oldWidget);

        if (newData !== oldData) {
            this.data = newData;
        }
    }

    render() {
        return (
            <NumberMatrixOutput
                data={this.data}
                faramElementName="value"
                placeholder={_ts('framework.numberWidget', 'numberPlaceholder')}
            />
        );
    }
}
