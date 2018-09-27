import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { iconNames } from '#constants';
import { routeIsFirstPageSelector } from '#redux';
import _ts from '#ts';

import styles from './styles.scss';

const mapStateToProps = state => ({
    isFirstPage: routeIsFirstPageSelector(state),
});

const propTypes = {
    isFirstPage: PropTypes.bool.isRequired,
    defaultLink: PropTypes.oneOfType([
        PropTypes.object, // eslint-disable-line react/forbid-prop-types
        PropTypes.string,
    ]).isRequired,
    title: PropTypes.string,
    className: PropTypes.string,
    iconName: PropTypes.string,
};


const defaultProps = {
    title: undefined,
    iconName: undefined,
    className: '',
};

@connect(mapStateToProps)
export default class BackLink extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    goBack = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.history.back();
        // NOTE: Don't know if this is required
        return false;
    }

    render() {
        const {
            isFirstPage,
            defaultLink,
            title,
            className,
            iconName,
        } = this.props;

        const classNames = [
            styles.backLink,
            className,
        ];

        const onClick = isFirstPage
            ? undefined
            : this.goBack;

        return (
            <Link
                className={classNames.join(' ')}
                title={title || _ts('components.backLink', 'backButtonTooltip')}
                to={defaultLink}
                onClick={onClick}
            >
                <i className={iconName || iconNames.back} />
            </Link>
        );
    }
}
