import React from 'react';
import PropTypes from 'prop-types';

import ScaleInput from '#rs/components/Input/ScaleInput';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
    widget: undefined,
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { scaleUnits = emptyArray } = {} } = {} } = widget;
    return scaleUnits;
};

const getValue = (widget) => {
    const { properties: { data: { value } = {} } = {} } = widget;
    return value;
};

export default class ScaleWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = option => option.key;
    static labelSelector = option => option.title;
    static colorSelector = option => option.color;

    isDefaultSelector = (option) => {
        const { widget } = this.props;
        const value = getValue(widget);
        return option.key === value;
    };

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <ScaleInput
                className={styles.scaleWidget}
                faramElementName="selectedScale"
                options={options}
                keySelector={ScaleWidget.keySelector}
                labelSelector={ScaleWidget.labelSelector}
                colorSelector={ScaleWidget.colorSelector}
                isDefaultSelector={this.isDefaultSelector}
            />
        );
    }
}
