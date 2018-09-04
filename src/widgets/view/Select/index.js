import React from 'react';
import PropTypes from 'prop-types';

import SelectOutput from '#widgetComponents/SelectOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
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

export default class SelectListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            widget,
        } = this.props;

        const options = getOptions(widget);

        return (
            <div className={className} >
                <SelectOutput
                    faramElementName="value"
                    options={options}
                />
            </div>
        );
    }
}
