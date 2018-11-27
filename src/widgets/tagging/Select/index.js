import React from 'react';
import PropTypes from 'prop-types';

import SelectInput from '#rsci/SelectInput';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { options = emptyArray } = {} } = {} } = widget;
    return options;
};

// eslint-disable-next-line react/prefer-stateless-function
export default class SelectWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <div className={styles.select}>
                <SelectInput
                    faramElementName="value"
                    options={options}
                    showLabel={false}
                />
            </div>
        );
    }
}
