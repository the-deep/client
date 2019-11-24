import React from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';

import Matrix1dInput from '#widgetComponents/Matrix1dInput';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object.isRequired,
};

const defaultProps = {
};

const emptyArray = [];
const emptyObject = {};

export default class Matrix1dOverviewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getOptions = memoize((widget) => {
        const {
            properties: {
                data: {
                    rows = emptyArray,
                    meta = emptyObject,
                } = {},
            } = {},
        } = widget;

        return {
            rows,
            meta,
        };
    });

    render() {
        const { widget } = this.props;
        const {
            rows,
            meta,
        } = this.getOptions(widget);

        return (
            <Matrix1dInput
                className={styles.input}
                faramElementName="value"
                options={rows}
                meta={meta}
            />
        );
    }
}
