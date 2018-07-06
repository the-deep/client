import React from 'react';
import PropTypes from 'prop-types';

import Matrix1dInput from './Matrix1dInput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getOptions = (widget = {}) => {
    const { properties: { data: { rows = emptyArray } = {} } = {} } = widget;
    return rows;
};

export default class Matrix1dOverviewWidget extends React.PureComponent {
    static valueKeyExtractor = d => d.key;

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <Matrix1dInput
                faramElementName="value"
                options={options}
            />
        );
    }
}
