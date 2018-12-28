import PropTypes from 'prop-types';
import React from 'react';

import FormattedDate from '#rscv/FormattedDate';
import { iconNames } from '#constants';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    icon: PropTypes.element,
    message: PropTypes.element,
    actions: PropTypes.element,
    timestamp: PropTypes.string,
};

const defaultProps = {
    className: '',
    icon: undefined,
    message: undefined,
    actions: undefined,
    timestamp: undefined,
};

export default class Notification extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: classNameFromProps,
            icon,
            message,
            actions,
            timestamp,
        } = this.props;

        const timestampIconClassName = `
            ${iconNames.calendar}
            ${styles.timestampIcon}
        `;

        const defaultIconClassName = `
            ${iconNames.notification}
            ${styles.defaultIcon}
        `;

        const className = `
            ${classNameFromProps}
            ${styles.notification}
        `;

        return (
            <div className={className}>
                <div className={styles.left}>
                    { icon }
                    { !icon && <span className={defaultIconClassName} /> }
                </div>
                <div className={styles.right}>
                    <div className={styles.message}>
                        { message }
                    </div>
                    <div className={styles.timestamp}>
                        <span className={timestampIconClassName} />
                        <FormattedDate
                            className={styles.date}
                            date={timestamp}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                    { actions && (
                        <div className={styles.actions}>
                            { actions }
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
