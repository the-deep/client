import PropTypes from 'prop-types';
import React from 'react';
import ReactSVG from 'react-svg';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
    matchPath,
} from 'react-router-dom';

import Confirm from '#rscv/Modal/Confirm';
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
    logoutAction,
} from '#redux';
import { stopSiloBackgroundTasksAction } from '#redux/middlewares/siloBackgroundTasks';
import _ts from '#ts';

import {
    pathNames,
    validLinks,
    hideNavbar,
} from '#constants';

import { envText, commitHash } from '#config/env';
import logo from '#resources/img/deep-logo-simplified.svg';

import Cloak from '#components/general/Cloak';
import NavMenu from './NavMenu';
import NavDrop from './NavDrop';
import Community from './Community';
import Notifica from './Notifica';
import HelpLink from './HelpLink';
import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    activeCountry: activeCountryIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    userProjects: currentUserProjectsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    logout: () => dispatch(logoutAction()),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
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
    logout: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
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

        this.state = {
            showLogoutConfirm: false,
        };

        this.setLinksForLocation(props.location);
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject: oldActiveProject,
            location: oldLocation,
        } = this.props;
        const {
            activeProject: newActiveProject,
            activeUser: newActiveUser,
            location: newLocation,
            userProjects,
        } = nextProps;

        // Set user project in server
        if (oldActiveProject !== newActiveProject && isTruthy(newActiveUser.userId)) {
            if (this.setUserProjectRequest) {
                this.setUserProjectRequest.stop();
            }

            const validProjectId = userProjects.findIndex(
                project => Navbar.projectKeySelector(project) === newActiveProject,
            ) !== -1;

            this.setUserProjectRequest = new BgRestBuilder()
                .url(createUrlForSetUserProject(newActiveUser.userId))
                .params(() => createParamsForSetUserProject(
                    validProjectId ? newActiveProject : null,
                ))
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

            'apiDocs',
            'visualization',
            'stringManagement',
            'workshop',
        ];

        this.validNavLinks = Navbar.getValidLinks(navLinks, this.currentPath);
        this.validDropLinks = Navbar.getValidLinks(dropLinks, this.currentPath);
    }

    handleProjectChange = (key) => {
        if (isTruthy(key)) {
            this.props.setActiveProject({ activeProject: key });
        }
    }

    handleLogoutClick = () => {
        this.setState({ showLogoutConfirm: true });
    }

    handleLogoutModalClose = (confirm) => {
        if (confirm) {
            this.props.stopSiloTasks();
            this.props.logout();
        }
        this.setState({ showLogoutConfirm: false });
    }

    render() {
        const {
            className,
            activeProject,
            activeCountry,
            userProjects,
        } = this.props;
        const { showLogoutConfirm } = this.state;

        // Hide navbar
        if (hideNavbar[this.currentPath]) {
            return <span className="no-nav" />;
        }

        const currentValidLinks = validLinks[this.currentPath];
        const projectSelectInputLink = currentValidLinks.projectSelect;
        const adminPanelLink = currentValidLinks.adminPanel;

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
                        title={commitHash}
                    >
                        {_ts('components.navbar', envText)}
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
                <HelpLink
                    className={styles.helpLink}
                    currentPath={this.currentPath}
                />
                <Community className={styles.communityDropdown} />
                <Notifica className={styles.notificationDropdown} />
                <NavDrop
                    className={styles.userMenu}
                    links={this.validDropLinks}
                    adminPanelLink={adminPanelLink}
                    onLogout={this.handleLogoutClick}
                />
                <Confirm
                    show={showLogoutConfirm}
                    onClose={this.handleLogoutModalClose}
                >
                    <p>
                        {_ts('components.navbar', 'logoutConfirmationText')}
                    </p>
                </Confirm>
            </nav>
        );
    }
}
