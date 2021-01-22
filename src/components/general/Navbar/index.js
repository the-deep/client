import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
    matchPath,
} from 'react-router-dom';
import {
    _cs,
    isTruthy,
    reverseRoute,
    getFirstKeyByValue,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Confirm from '#rscv/Modal/Confirm';
import { BgRestBuilder } from '#rsu/rest';
import SelectInput from '#rsci/SelectInput';

import Badge from '#components/viewer/Badge';

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

import {
    envText,
    commitHash,
} from '#config/env';

import Cloak from '#components/general/Cloak';
import NavMenu from './NavMenu';
import NavDrop from './NavDrop';
import Community from './Community';
import Notifica from './Notifica';
import HelpLink from './HelpLink';
import ThemeMenu from './ThemeMenu';
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

    static shouldHideThemeMenu = ({ isDevMode }) => !isDevMode;

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
            ? getFirstKeyByValue(pathNames, this.currentMatch.path)
            : 'fourHundredFour';

        const navLinks = [
            'dashboard',
            'leads',
            'entries',
            'arys',
            'projectQuestionnaires',
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

    optionLabelSelector = (option = {}) => (
        <div className={styles.selectOption}>
            {option.title}
            {option.isPrivate && (
                <Badge
                    icon="locked"
                    className={
                        _cs(
                            styles.badge,
                            this.props.activeProject === option.id && styles.active,
                        )
                    }
                    noBorder
                    tooltip={_ts('project', 'priivateProjectBadgeTooltip')}
                />
            )}
        </div>
    )

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
                    to={reverseRoute(pathNames.landingPage, {})}
                    className={styles.brand}
                >
                    <div className={styles.iconWrapper}>
                        <Icon
                            className={styles.icon}
                            name="deepLogo"
                        />
                    </div>
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

                <div className={styles.projectSelectInputWrapper}>
                    <Cloak
                        {...projectSelectInputLink}
                        render={
                            <SelectInput
                                hideClearButton
                                keySelector={Navbar.projectKeySelector}
                                labelSelector={Navbar.projectLabelSelector}
                                optionLabelSelector={this.optionLabelSelector}
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
                </div>

                <NavMenu
                    links={this.validNavLinks}
                    className={styles.mainMenu}
                    projectId={activeProject}
                    countryId={activeCountry}
                />

                <div className={styles.actions}>
                    <HelpLink
                        className={styles.helpLink}
                        currentPath={this.currentPath}
                    />
                    <Community className={styles.communityDropdown} />
                    <Notifica className={styles.notificationDropdown} />
                    <Cloak
                        hide={Navbar.shouldHideThemeMenu}
                        render={
                            <ThemeMenu
                                className={styles.themeMenu}
                            />
                        }
                    />
                </div>
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
