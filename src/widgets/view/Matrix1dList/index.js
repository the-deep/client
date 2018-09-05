import React from 'react';
import PropTypes from 'prop-types';

import Matrix1dList from '#widgetComponents/Matrix1dListOutput';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
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
            widget,
        } = this.props;

        const rows = getRows(widget);

        return (
            <Matrix1dList
                className={className}
                faramElementName="value"
                rows={rows}
            />
        );
    }
}
