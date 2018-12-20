import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import { currentUserActiveProjectSelector } from '#redux';
import logo from '#resources/img/deep-logo.svg';

import _ts from '#ts';

import styles from './styles.scss';

const getEnvironmentText = () => {
    switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
        case 'beta':
            return _ts('dashboard', 'betaLabel');
        case 'alpha':
            return _ts('dashboard', 'alphaLabel');
        case 'nightly':
            return _ts('dashboard', 'nightlyLabel');
        default:
            return _ts('dashboard', 'devLabel');
    }
};

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    currentUserActiveProject: currentUserActiveProjectSelector(state),
});

@connect(mapStateToProps, undefined)
export default class Dashboard extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { currentUserActiveProject } = this.props;

        const envText = getEnvironmentText();

        return (
            <div className={styles.dashboard}>
                <p className={styles.header}>
                    { currentUserActiveProject.title }
                </p>
                <div className={styles.content}>
                    <ReactSVG
                        svgClassName={styles.deepLogo}
                        path={logo}
                    />
                    <div className={styles.deepText} >
                        {_ts('dashboard', 'deepLabel')} {envText}
                    </div>
                </div>
            </div>
        );
    }
}
