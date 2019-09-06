import PropTypes from 'prop-types';
import React from 'react';

import _cs from '#cs';

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
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            styles.widgetListItem,
            classNameFromProps,
            active && styles.active,
        );

        return (
            <button
                className={className}
                onClick={this.handleClick}
            >
                <div className={styles.title}>
                    {title}
                </div>
            </button>
        );
    }
}
