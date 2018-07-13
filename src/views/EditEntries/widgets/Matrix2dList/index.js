import React from 'react';
import PropTypes from 'prop-types';

import Matrix2dListInput from '#widgetComponents/Matrix2dListInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getDimensions = (widget) => {
    const { properties: { data: { dimensions = emptyArray } = {} } = {} } = widget;
    return dimensions;
};

const getSectors = (widget) => {
    const { properties: { data: { sectors = emptyArray } = {} } = {} } = widget;
    return sectors;
};
export default class Matrix1dListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const dimensions = getDimensions(widget);
        const sectors = getSectors(widget);

        return (
            <Matrix2dListInput
                faramElementName="value"
                dimensions={dimensions}
                sectors={sectors}
            />
        );
    }
}
