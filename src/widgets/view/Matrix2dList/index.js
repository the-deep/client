import React from 'react';
import PropTypes from 'prop-types';

import Matrix2dList from '#widgetComponents/Matrix2dListOutput';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    data: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    data: {},
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

export default class Matrix2dListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
            widget,
        } = this.props;

        const dimensions = getDimensions(widget);
        const sectors = getSectors(widget);

        const { value } = data;

        return (
            <Matrix2dList
                className={className}
                value={value}
                dimensions={dimensions}
                sectors={sectors}
            />
        );
    }
}
