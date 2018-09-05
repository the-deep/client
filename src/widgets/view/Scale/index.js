import React from 'react';
import PropTypes from 'prop-types';

import ScaleInput from '#rsci/ScaleInput';


const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    className: PropTypes.string,
};

const defaultProps = {
    widget: undefined,
    className: '',
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { scaleUnits = emptyArray } = {} } = {} } = widget;
    return scaleUnits;
};

export default class ScaleWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = option => option.key;
    static labelSelector = option => option.title;
    static colorSelector = option => option.color;

    render() {
        const {
            className,
            widget,
        } = this.props;

        const options = getOptions(widget);

        return (
            <ScaleInput
                className={className}
                faramElementName="value"
                options={options}
                keySelector={ScaleWidget.keySelector}
                labelSelector={ScaleWidget.labelSelector}
                colorSelector={ScaleWidget.colorSelector}
                readOnly
            />
        );
    }
}
