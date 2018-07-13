import React from 'react';
import PropTypes from 'prop-types';

import Matrix1dListOutput from '#widgetComponents/Matrix1dListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getRows = (widget = {}) => {
    const { properties: { data: { rows = emptyArray } = {} } = {} } = widget;
    return rows;
};

export default class Matrix1dListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const rows = getRows(widget);

        return (
            <Matrix1dListOutput
                faramElementName="value"
                rows={rows}
            />
        );
    }
}
