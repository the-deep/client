import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';

import Page from '#rscv/Page';
import { currentUserActiveProjectSelector } from '#redux';
import logo from '#resources/img/deep-logo.svg';

import { envText } from '#config/env';
import _ts from '#ts';

import styles from './styles.scss';

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

        return (
            <Page
                className={styles.dashboard}
                mainContentClassName={styles.mainContent}
                mainContent={
                    <React.Fragment>
                        <ReactSVG
                            svgClassName={styles.deepLogo}
                            path={logo}
                        />
                        <div className={styles.deepText} >
                            {_ts('dashboard', 'deepLabel')} {_ts('dashboard', envText)}
                        </div>
                    </React.Fragment>
                }
            />
        );
    }
}
