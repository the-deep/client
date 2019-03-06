import PropTypes from 'prop-types';
import React from 'react';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';
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

        const className = `
            ${classNameFromProps}
            ${styles.notification}
        `;

        return (
            <div className={className}>
                <div className={styles.left}>
                    { icon }
                    { !icon &&
                        <Icon
                            name="defaultIcon"
                            className={styles.defaultIcon}
                        />
                    }
                </div>
                <div className={styles.right}>
                    <div className={styles.message}>
                        { message }
                    </div>
                    <div className={styles.timestamp}>
                        <Icon
                            className={styles.timestampIcon}
                            name="calendar"
                        />
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
