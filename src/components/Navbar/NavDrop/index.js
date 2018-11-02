import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
} from 'react-router-dom';

import DisplayPicture from '#components/DisplayPicture';
import { reverseRoute } from '#rsu/common';
import List from '#rscv/List';
import DropdownMenu from '#rsca/DropdownMenu';
import DropdownGroup from '#rsca/DropdownMenu/Group';

import { stopSiloBackgroundTasksAction } from '#redux/middlewares/siloBackgroundTasks';
import { adminEndpoint } from '#config/rest';
import {
    logoutAction,
    activeCountryIdFromStateSelector,
    activeProjectIdFromStateSelector,
    activeUserSelector,
    currentUserInformationSelector,
} from '#redux';
import {
    iconNames,
    pathNames,
} from '#constants';
import _ts from '#ts';

import Cloak from '../../Cloak';
import styles from './styles.scss';

const AdminPanelLink = ({ disabled }) => (
    <a
        className={`${styles.dropdownItem} ${disabled ? styles.disabled : ''}`}
        href={adminEndpoint}
        target="_blank"
        disabled={disabled}
    >
        <span className={`${styles.icon} ${iconNames.locked}`} />
        {_ts('components.navbar', 'adminPanelLabel')}
    </a>
);

const LogoutLink = ({ disabled, onClick }) => (
    <DropdownGroup>
        <button
            className={styles.dropdownItem}
            onClick={onClick}
            disabled={disabled}
        >
            <span className={`${styles.icon} ${iconNames.logout}`} />
            {_ts('components.navbar', 'logoutLabel')}
        </button>
    </DropdownGroup>
);

const DropItem = ({ itemKey, disabled, to, iconName }) => (
    <Link
        to={to}
        className={`${styles.dropdownItem} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
    >
        { iconName && <span className={`${iconName} ${styles.icon}`} />}
        { _ts('pageTitle', itemKey) }
    </Link>
);

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    activeCountry: activeCountryIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
});

const mapDispatchToProps = dispatch => ({
    logout: () => dispatch(logoutAction()),
    stopSiloTasks: () => dispatch(stopSiloBackgroundTasksAction()),
});

const propTypes = {
    className: PropTypes.string,
    activeCountry: PropTypes.number,
    activeProject: PropTypes.number,
    logout: PropTypes.func.isRequired,
    stopSiloTasks: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userInformation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    links: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    adminPanelLink: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    activeProject: undefined,
    activeCountry: undefined,
    activeUser: {},
    userInformation: {},
};

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
export default class NavDrop extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static dropdownItemIcons = {
        apiDocs: iconNames.code,
        userProfile: iconNames.person,
        stringManagement: iconNames.world,
        projects: iconNames.map,
        countries: iconNames.globe,
        connectors: iconNames.link,
        notifications: iconNames.notifications,
        visualization: iconNames.pizza,
    };

    static getDropItemKey = item => item.key

    handleLogoutButtonClick = () => {
        this.props.stopSiloTasks();
        this.props.logout();
    }

    renderDropItem = (key, item) => {
        const {
            activeProject,
            activeCountry,
            activeUser = {},
        } = this.props;

        const params = {
            projectId: activeProject,
            countryId: activeCountry,
            userId: activeUser.userId,
        };

        const iconName = NavDrop.dropdownItemIcons[key];
        const to = reverseRoute(pathNames[key], params);

        return (
            <Cloak
                {...item}
                key={key}
                render={
                    <DropItem
                        itemKey={key}
                        to={to}
                        iconName={iconName}
                    />
                }
            />
        );
    }

    render() {
        const {
            activeUser,
            userInformation,
            className,
            links,
            adminPanelLink,
        } = this.props;

        const userName = (
            userInformation.displayName ||
            activeUser.displayName ||
            _ts('components.navbar', 'anonymousLabel')
        );

        const displayPicture = (
            userInformation.displayPicture ||
            activeUser.displayPicture
        );

        return (
            <DropdownMenu
                className={className}
                leftComponent={
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={displayPicture}
                    />
                }
                title={userName}
                dropdownClassName={styles.userDropdown}
            >
                <DropdownGroup>
                    <List
                        data={links}
                        keySelector={NavDrop.getDropItemKey}
                        modifier={this.renderDropItem}
                    />
                    <Cloak
                        {...adminPanelLink}
                        render={
                            <AdminPanelLink />
                        }
                    />
                </DropdownGroup>
                <Link
                    target="_blank"
                    className={styles.dropdownItem}
                    to="https://chrome.google.com/webstore/detail/deep-2-add-lead/kafonkgglonkbldmcigbdojiadfcmcdc"
                >
                    <span className={`${styles.icon} ${iconNames.chrome}`} />
                    <span className={styles.label}>
                        { _ts('pageTitle', 'browserExtension') }
                    </span>
                </Link>
                <Cloak
                    hide={({ isLoggedIn }) => !isLoggedIn}
                    render={
                        <LogoutLink
                            onClick={this.handleLogoutButtonClick}
                        />
                    }
                />
            </DropdownMenu>
        );
    }
}
