import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    active: false,
};

export default class LinkItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {
            onClick,
            widgetKey,
        } = this.props;

        onClick(widgetKey);
    }

    render() {
        const {
            title,
            active,
            className,
        } = this.props;

        const classNames = [
            styles.widgetListItem,
            className,
        ];
        if (active) {
            classNames.push(styles.active);
        }

        return (
            <button
                className={classNames.join(' ')}
                onClick={this.handleClick}
            >
                <div className={styles.title}>
                    {title}
                </div>
            </button>
        );
    }
}

