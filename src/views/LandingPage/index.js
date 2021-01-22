import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';

import { reverseRoute } from '@togglecorp/fujs';

import {
    activeProjectIdFromStateSelector,
    activeUserSelector,
    currentUserProjectsSelector,
} from '#redux';

import Icon from '#rscg/Icon';
import Page from '#rscv/Page';
import { pathNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';


const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    currentUserProjects: currentUserProjectsSelector(state),
});

const propTypes = {
    activeProject: PropTypes.number,
    currentUserProjects: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
};

const defaultProps = {
    activeProject: undefined,
    activeUser: {},
};

@connect(mapStateToProps, undefined)
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            currentUserProjects,
            activeProject,
            location,
            activeUser,
        } = this.props;

        if (activeProject && currentUserProjects.length > 0) {
            const params = { projectId: activeProject };
            const routeTo = reverseRoute(pathNames.home, params);
            return (
                <Redirect
                    to={{
                        pathname: routeTo,
                        from: location,
                    }}
                />
            );
        }

        const linkToProfile = reverseRoute(
            pathNames.userProfile,
            { userId: activeUser.userId },
        );

        const linkToDiscoverProjects = reverseRoute(
            pathNames.discoverProjects,
        );

        return (
            <Page
                mainContentClassName={styles.landingPage}
                mainContent={
                    <React.Fragment>
                        <Icon
                            className={styles.deepLogo}
                            name="deepLogo"
                        />
                        <div className={styles.container}>
                            <span className={styles.welcomeMessage}>
                                {_ts('homescreen', 'welcomeText')} <strong>{_ts('homescreen', 'deepLabel')}</strong>
                                <br />
                            </span>
                            {_ts('homescreen', 'message1')}
                            <br />
                            {_ts('homescreen', 'message2')}
                            <br />
                        </div>
                        <div className={styles.links}>
                            <Link
                                className={styles.profileLink}
                                to={linkToProfile}
                            >
                                {_ts('homescreen', 'goToProfile')}
                            </Link>
                            <Link
                                className={styles.discoverProjectsLink}
                                to={linkToDiscoverProjects}
                            >
                                {_ts('homescreen', 'goToDiscoverProjects')}
                            </Link>
                        </div>
                    </React.Fragment>
                }
            />
        );
    }
}
