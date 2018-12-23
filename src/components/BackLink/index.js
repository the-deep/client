import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { iconNames } from '#constants';
import { routeIsFirstPageSelector } from '#redux';
import _cs from '#cs';
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
    children: PropTypes.node,
};


const defaultProps = {
    title: undefined,
    iconName: undefined,
    className: '',
    children: undefined,
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
            title = _ts('components.backLink', 'backButtonTooltip'),
            className: classNameFromProps,
            iconName = iconNames.back,
            children,
        } = this.props;


        const onClick = isFirstPage
            ? undefined
            : this.goBack;

        const className = _cs(
            styles.backLink,
            classNameFromProps,
        );

        return (
            <Link
                className={className}
                title={title}
                to={defaultLink}
                onClick={onClick}
            >
                { children || <i className={iconName} /> }
            </Link>
        );
    }
}
