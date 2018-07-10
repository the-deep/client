import React from 'react';
import PropTypes from 'prop-types';

import Matrix2dInput from './Matrix2dInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getDimensions = (widget = {}) => {
    const { properties: { data: { dimensions = emptyArray } = {} } = {} } = widget;
    return dimensions;
};

const getSectors = (widget = {}) => {
    const { properties: { data: { sectors = emptyArray } = {} } = {} } = widget;
    return sectors;
};

export default class Matrix2dOverviewWidget extends React.PureComponent {
    static valueKeyExtractor = d => d.key;

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const dimensions = getDimensions(widget);
        const sectors = getSectors(widget);

        return (
            <Matrix2dInput
                faramElementName="value"
                dimensions={dimensions}
                sectors={sectors}
            />
        );
    }
}
