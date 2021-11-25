import React, { useRef, useEffect, useMemo, useCallback, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
} from 'react-router-dom';
import {
    _cs,
    isTruthy,
    isDefined,
    reverseRoute,
    getFirstKeyByValue,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Confirm from '#rscv/Modal/Confirm';
import { useLazyRequest } from '#utils/request';
import SelectInput from '#rsci/SelectInput';
import { SelectInput as NewSelectInput, QuickActionLink } from '@the-deep/deep-ui';

import Badge from '#components/viewer/Badge';

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
    showSubNavbar,
    getCurrentMatch,
    viewsAcl,
} from '#constants';
import featuresMapping from '#constants/features';
import NavbarContext from '#components/NavbarContext';

import {
    envText,
    commitHash,
} from '#config/env';

import Cloak from '#components/general/Cloak';
import NavMenu from './NavMenu';
import NavDrop from './NavDrop';
import HelpLink from './HelpLink';
import ThemeMenu from './ThemeMenu';

import styles from './styles.scss';

export const SubNavbar = ({
    children,
}) => {
    const { parentNode } = useContext(NavbarContext);
    if (!parentNode) {
        return null;
    }
    return ReactDOM.createPortal(
        children,
        parentNode,
    );
};


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
        // eslint-disable-next-line react/forbid-prop-types
        accessibleFeatures: PropTypes.array,
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

const projectKeySelector = (option = {}) => option.id;
const projectLabelSelector = (option = {}) => option.title;

const getValidLinks = (navLinks, currentPath) => {
    const currentValidLinks = validLinks[currentPath];
    return navLinks
        .map(link => ({ key: link, ...currentValidLinks[link] }))
        .filter(d => !!d);
};

const shouldHideThemeMenu = ({ isDevMode }) => !isDevMode;

function Navbar(props) {
    const {
        className,
        activeProject,
        activeCountry,
        userProjects,
        stopSiloTasks,
        logout,
        activeUser: {
            userId,
            accessibleFeatures,
        },
        location,
        setActiveProject,
    } = props;

    const subNavbarRef = useRef(null);

    const { setParentNode } = useContext(NavbarContext);

    useEffect(
        () => {
            setParentNode(subNavbarRef.current);
        },
        [setParentNode, location],
    );

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutModalClose = useCallback((confirm) => {
        if (confirm) {
            stopSiloTasks();
            logout();
            localStorage.removeItem('primaryTagging');
            localStorage.removeItem('secondaryTagging');
        }
        setShowLogoutConfirm(false);
    }, [logout, stopSiloTasks]);

    const currentMatch = useMemo(() => getCurrentMatch(location), [location]);

    const currentPath = useMemo(() => (
        isDefined(currentMatch)
            ? getFirstKeyByValue(pathNames, currentMatch.path) : 'fourHundredFour'
    ), [currentMatch]);

    const validNavLinks = useMemo(() => {
        const navLinks = [
            'leads',
            'entries',
            'arys',
            'projectQuestionnaires',
            'export',
            'analysisModule',
        ];

        const accessNewUi = accessibleFeatures?.find(f => f.key === featuresMapping.newUi);
        if (accessNewUi) {
            navLinks.unshift('home', 'tagging');
        }
        return getValidLinks(navLinks, currentPath);
    }, [currentPath, accessibleFeatures]);

    const validDropLinks = useMemo(() => {
        const dropLinks = [
            'userProfile',
            'projects',
            'countries',
            'connectors',

            'stringManagement',
        ];
        return getValidLinks(dropLinks, currentPath);
    }, [currentPath]);

    const handleLogoutClick = useCallback(() => {
        setShowLogoutConfirm(true);
    }, []);

    const { trigger: triggerChangeActiveProject } = useLazyRequest({
        url: `server://users/${userId}/`,
        body: ctx => ctx,
        method: 'PATCH',
    });

    const handleProjectChange = useCallback((key) => {
        if (isTruthy(key)) {
            const isValidProject = userProjects.findIndex(
                project => projectKeySelector(project) === key,
            ) !== -1;
            if (isValidProject) {
                setActiveProject({ activeProject: key });
                triggerChangeActiveProject({ lastActiveProject: key });
            }
        }
    }, [setActiveProject, triggerChangeActiveProject, userProjects]);

    const optionLabelSelector = useCallback((option = {}) => (
        <div className={styles.selectOption}>
            {option.title}
            {option.isPrivate && (
                <Badge
                    icon="locked"
                    className={
                        _cs(
                            styles.badge,
                            activeProject === option.id && styles.active,
                        )
                    }
                    noBorder
                    tooltip={_ts('project', 'privateProjectBadgeTooltip')}
                />
            )}
        </div>
    ), [activeProject]);

    // Hide navbar
    if (hideNavbar[currentPath]) {
        return <span className="no-nav" />;
    }

    const currentValidLinks = validLinks[currentPath];
    const projectSelectInputLink = currentValidLinks.projectSelect;
    const adminPanelLink = currentValidLinks.adminPanel;

    const editLink = reverseRoute(pathNames.editProject, {
        projectId: activeProject,
    });

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.topNavbar}>
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

                {!showSubNavbar[currentPath] && (
                    <div className={styles.projectSelectInputWrapper}>
                        <Cloak
                            {...projectSelectInputLink}
                            render={
                                <SelectInput
                                    hideClearButton
                                    keySelector={projectKeySelector}
                                    labelSelector={projectLabelSelector}
                                    optionLabelSelector={optionLabelSelector}
                                    onChange={handleProjectChange}
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
                )}

                <NavMenu
                    links={validNavLinks}
                    className={styles.mainMenu}
                    projectId={activeProject}
                    countryId={activeCountry}
                />

                <div className={styles.actions}>
                    <HelpLink
                        className={styles.helpLink}
                        currentPath={currentPath}
                    />
                    <Cloak
                        hide={shouldHideThemeMenu}
                        render={
                            <ThemeMenu
                                className={styles.themeMenu}
                            />
                        }
                    />
                </div>
                <NavDrop
                    className={styles.userMenu}
                    links={validDropLinks}
                    adminPanelLink={adminPanelLink}
                    onLogout={handleLogoutClick}
                />
                <Confirm
                    show={showLogoutConfirm}
                    onClose={handleLogoutModalClose}
                >
                    <p>
                        {_ts('components.navbar', 'logoutConfirmationText')}
                    </p>
                </Confirm>
            </div>
            {showSubNavbar[currentPath] && (
                <div className={styles.subNavbar}>
                    <div className={styles.projectSelectInputWrapper}>
                        <Cloak
                            {...projectSelectInputLink}
                            render={
                                <NewSelectInput
                                    className={styles.projectSelectInput}
                                    nonClearable
                                    keySelector={projectKeySelector}
                                    labelSelector={projectLabelSelector}
                                    optionLabelSelector={optionLabelSelector}
                                    onChange={handleProjectChange}
                                    options={userProjects}
                                    placeholder={_ts('components.navbar', 'selectEventPlaceholder')}
                                    value={activeProject}
                                    variant="general"
                                />
                            }
                        />
                        <Cloak
                            {...viewsAcl.editProject}
                            render={activeProject && (
                                <QuickActionLink
                                    to={editLink}
                                >
                                    <Icon name="edit" />
                                </QuickActionLink>
                            )}
                        />
                    </div>
                    <div
                        className={styles.subNavbarRightComponents}
                        ref={subNavbarRef}
                    />
                </div>
            )}
        </nav>
    );
}

Navbar.propTypes = propTypes;
Navbar.defaultProps = defaultProps;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navbar));
