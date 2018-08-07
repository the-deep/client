import React from 'react';
import PropTypes from 'prop-types';

import Matrix1dInput from '#widgetComponents/Matrix1dInput';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
};

const emptyArray = [];
const getOptions = (widget) => {
    const { properties: { data: { rows = emptyArray } = {} } = {} } = widget;
    return rows;
};

export default class Matrix1dOverviewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { widget } = this.props;
        const options = getOptions(widget);

        return (
            <Matrix1dInput
                className={styles.input}
                faramElementName="value"
                options={options}
            />
        );
    }
}
