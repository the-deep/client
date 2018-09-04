import React from 'react';
import PropTypes from 'prop-types';

import MultiSelectListOutput from '#widgetComponents/MultiSelectListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { options = emptyArray } = {} } = {} } = widget;
    return options;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class MultiSelectViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static labelSelector = o => o.label;
    static keySelector = o => o.key;

    render() {
        const {
            widget,
            className,
        } = this.props;
        const options = getOptions(widget);

        return (
            <MultiSelectListOutput
                faramElementName="value"
                className={className}
                options={options}
                labelSelector={MultiSelectViewWidget.labelSelector}
                keySelector={MultiSelectViewWidget.keySelector}
            />
        );
    }
}
