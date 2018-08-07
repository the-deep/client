import React from 'react';
import PropTypes from 'prop-types';

import Matrix1dList from '#widgetComponents/Matrix1dListOutput';

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
const getRows = (widget) => {
    const { properties: { data: { rows = emptyArray } = {} } = {} } = widget;
    return rows;
};

export default class Matrix1dListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            data,
            widget,
        } = this.props;

        const { value } = data;
        const rows = getRows(widget);

        return (
            <Matrix1dList
                className={className}
                rows={rows}
                value={value}
            />
        );
    }
}
