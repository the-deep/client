import React from 'react';
import PropTypes from 'prop-types';

import NormalFormattedDate from '#rscv/FormattedDate';
import { FaramOutputElement } from '#rscg/FaramElements';
import _ts from '#ts';

import styles from './styles.scss';

const FormattedDate = FaramOutputElement(NormalFormattedDate);

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

const emptyComponent = () => (
    // FIXME: use strings
    <div className={styles.empty}>
        dd-mm-yyyy
    </div>
);

// eslint-disable-next-line react/prefer-stateless-function
export default class DateRangeViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
        } = this.props;

        return (
            <div className={`${className} ${styles.dateRange}`}>
                <FormattedDate
                    faramElementName="fromValue"
                    className={styles.date}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
                <span className={styles.to}>
                    {_ts('widgets.view.dateRange', 'toLabel')}
                </span>
                <FormattedDate
                    faramElementName="toValue"
                    className={styles.date}
                    mode="dd-MM-yyyy"
                    emptyComponent={emptyComponent}
                />
            </div>
        );
    }
}
