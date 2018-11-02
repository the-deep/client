import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
    matchPath,
} from 'react-router-dom';


import { BgRestBuilder } from '#rsu/rest';
import {
    isTruthy,
    reverseRoute,
} from '#rsu/common';
import SelectInput from '#rsci/SelectInput';

import {
    createUrlForSetUserProject,
    createParamsForSetUserProject,
} from '#rest';
import {
    setActiveProjectAction,

    activeCountryIdFromStateSelector,
    activeProjectIdFromStateSelector,
    activeUserSelector,
    currentUserProjectsSelector,
} from '#redux';
import _ts from '#ts';

import {
    pathNames,
    validLinks,
    hideNavbar,
} from '#constants';
import logo from '#resources/img/deep-logo-simplified.svg';
import slackLogo from '#resources/img/slack.png';
import skypeLogo from '#resources/img/skype.png';

import Cloak from '../Cloak';
import NavMenu from './NavMenu';
import NavDrop from './NavDrop';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    activeCountry: activeCountryIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

const propTypes = {
    className: PropTypes.string,
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    setActiveProject: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            name: PropTypes.string,
        }),
    ),
    location: PropTypes.shape({
        pathname: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    className: '',
    activeProject: undefined,
    activeCountry: undefined,
    activeUser: {},
    userProjects: [],
};

const getKeyByValue = (object, value) => (
    Object.keys(object).find(key => object[key] === value)
);

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
export default class Navbar extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static projectKeySelector = (option = {}) => (option.id)
    static projectLabelSelector = (option = {}) => (option.title)

    static getCurrentMatch = (location) => {
        const links = Object.keys(pathNames);
        const paths = Object.values(pathNames);

        for (let i = 0; i < links.length; i += 1) {
            const match = matchPath(location.pathname, {
                path: paths[i],
                exact: true,
            });

            if (match) {
                return match;
            }
        }

        return null;
    }

    static getValidLinks = (navLinks, currentPath) => {
        const currentValidLinks = validLinks[currentPath];
        return navLinks
            .map(link => ({ key: link, ...currentValidLinks[link] }))
            .filter(d => !!d);
    }

    constructor(props) {
        super(props);

        this.setLinksForLocation(props.location);
    }

    componentWillReceiveProps(nextProps) {
        const {
            userProjects: oldUserProjects,
            activeProject: oldActiveProject,
            location: oldLocation,
        } = this.props;
        const {
            userProjects: newUserProjects,
            activeProject: newActiveProject,
            activeUser: newActiveUser,
            location: newLocation,
        } = nextProps;

        // TODO: move this block to reducers of siloDomainData:common
        // If active project has changed, then set active project
        // NOTE: if active project id is not in userProjects,
        // then set first project id from users project
        if (oldUserProjects !== newUserProjects) {
            const activeProjectIndex = newUserProjects.findIndex(
                p => p.id === newActiveProject,
            );
            if (activeProjectIndex === -1) {
                this.props.setActiveProject({
                    activeProject: (newUserProjects.length > 0) ? newUserProjects[0].id : undefined,
                });
            }
        }

        // Set user project in server
        if (oldActiveProject !== newActiveProject && isTruthy(newActiveUser.userId)) {
            console.warn('Project id changed from ', oldActiveProject, 'to', newActiveProject);

            if (this.setUserProjectRequest) {
                this.setUserProjectRequest.stop();
            }
            this.setUserProjectRequest = new BgRestBuilder()
                .url(createUrlForSetUserProject(newActiveUser.userId))
                .params(() => createParamsForSetUserProject(newActiveProject))
                .delay(1000) // more delay
                .build();
            this.setUserProjectRequest.start();
        }

        if (oldLocation !== newLocation) {
            this.setLinksForLocation(newLocation);
        }
    }

    componentWillUnmount() {
        if (this.setUserProjectRequest) {
            this.setUserProjectRequest.stop();
        }
    }

    setLinksForLocation = (location) => {
        this.currentMatch = Navbar.getCurrentMatch(location);
        this.currentPath = this.currentMatch
            ? getKeyByValue(pathNames, this.currentMatch.path)
            : 'fourHundredFour';

        const navLinks = [
            'leads',
            'entries',
            'arys',
            'export',
        ];

        const dropLinks = [
            'userProfile',
            'projects',
            'countries',
            'connectors',
            'notifications',

            'apiDocs',
            'visualization',
            'stringManagement',
        ];

        this.validNavLinks = Navbar.getValidLinks(navLinks, this.currentPath);
        this.validDropLinks = Navbar.getValidLinks(dropLinks, this.currentPath);
    }

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    render() {
        const {
            className,
            activeProject,
            activeCountry,
            userProjects,
        } = this.props;

        // Hide navbar
        if (hideNavbar[this.currentPath]) {
            return <span className="no-nav" />;
        }

        const currentValidLinks = validLinks[this.currentPath];
        const projectSelectInputLink = currentValidLinks.projectSelect;
        const adminPanelLink = currentValidLinks.adminPanel;

        let betaLabel;
        switch (process.env.REACT_APP_DEEP_ENVIRONMENT) {
            case 'beta':
                betaLabel = _ts('components.navbar', 'betaLabel');
                break;
            case 'alpha':
                betaLabel = _ts('components.navbar', 'alphaLabel');
                break;
            case 'nightly':
                betaLabel = _ts('components.navbar', 'nightlyLabel');
                break;
            default:
                betaLabel = _ts('components.navbar', 'devLabel');
                break;
        }

        const slackLink = 'https://goo.gl/13pcuA';
        const skypeLink = 'https://join.skype.com/idYxL8ozLDOD';
        const slackLinkTitle = _ts('components.navbar', 'slackLinkTitle');
        const skypeLinkTitle = _ts('components.navbar', 'skypeLinkTitle');

        return (
            <nav className={`${className} ${styles.navbar}`}>
                <Link
                    to={reverseRoute(pathNames.homeScreen, {})}
                    className={styles.brand}
                >
                    <ReactSVG
                        className={styles.iconWrapper}
                        svgClassName={styles.icon}
                        path={logo}
                    />
                    <div className={styles.title}>
                        {_ts('components.navbar', 'deepLabel')}
                    </div>
                    <span
                        className={styles.betaLabel}
                        title={process.env.REACT_APP_DEEP_COMMIT_SHA}
                    >
                        {betaLabel}
                    </span>
                </Link>

                <Cloak
                    {...projectSelectInputLink}
                    render={
                        <SelectInput
                            hideClearButton
                            keySelector={Navbar.projectKeySelector}
                            labelSelector={Navbar.projectLabelSelector}
                            onChange={this.handleProjectChange}
                            options={userProjects}
                            placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                            showHintAndError={false}
                            showLabel={false}
                            className={styles.projectSelectInput}
                            value={activeProject}
                        />
                    }
                />

                <NavMenu
                    links={this.validNavLinks}
                    className={styles.mainMenu}
                    projectId={activeProject}
                    countryId={activeCountry}
                />
                <a
                    className={styles.joinLink}
                    href={slackLink}
                    target="_blank"
                >
                    <img
                        className={styles.image}
                        src={slackLogo}
                        alt=""
                        title={slackLinkTitle}
                    />
                </a>
                <a
                    className={styles.joinLink}
                    href={skypeLink}
                    target="_blank"
                >
                    <img
                        className={styles.image}
                        title={skypeLinkTitle}
                        alt=""
                        src={skypeLogo}
                    />
                </a>
                <NavDrop
                    className={styles.userMenu}
                    links={this.validDropLinks}
                    adminPanelLink={adminPanelLink}
                />
            </nav>
        );
    }
}
