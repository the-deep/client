import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    withRouter,
    Link,
} from 'react-router-dom';
import {
    reverseRoute,
    _cs,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import List from '#rscv/List';
import DropdownMenu from '#rsca/DropdownMenu';
import DropdownGroup from '#rsca/DropdownMenu/Group';

import { adminEndpoint } from '#config/rest';
import {
    activeCountryIdFromStateSelector,
    activeProjectIdFromStateSelector,
    activeUserSelector,
    currentUserInformationSelector,
} from '#redux';
import {
    pathNames,
} from '#constants';
import _ts from '#ts';

import DisplayPicture from '#components/viewer/DisplayPicture';
import Cloak from '#components/general/Cloak';
import styles from './styles.scss';

const AdminPanelLink = ({ disabled }) => (
    <a
        className={`${styles.dropdownItem} ${disabled ? styles.disabled : ''}`}
        href={adminEndpoint}
        target="_blank"
        rel="noopener noreferrer"
        disabled={disabled}
    >
        <Icon
            className={styles.icon}
            name="locked"
        />
        {_ts('components.navbar', 'adminPanelLabel')}
    </a>
);
AdminPanelLink.propTypes = {
    disabled: PropTypes.bool,
};
AdminPanelLink.defaultProps = {
    disabled: false,
};

const LogoutLink = ({ disabled, onClick }) => (
    <DropdownGroup>
        <button
            className={styles.dropdownItem}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon
                className={styles.icon}
                name="logout"
            />
            {_ts('components.navbar', 'logoutLabel')}
        </button>
    </DropdownGroup>
);
LogoutLink.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
};
LogoutLink.defaultProps = {
    disabled: false,
};

const DropItem = ({ itemKey, disabled, iconName, ...otherProps }) => (
    <Link
        to={reverseRoute(pathNames[itemKey], otherProps)}
        className={`${styles.dropdownItem} ${disabled ? styles.disabled : ''}`}
        disabled={disabled}
    >
        { iconName &&
            <Icon
                className={styles.icon}
                name={iconName}
            />
        }
        { _ts('pageTitle', itemKey) }
    </Link>
);
DropItem.propTypes = {
    itemKey: PropTypes.string.isRequired,
    iconName: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
DropItem.defaultProps = {
    disabled: false,
};

const mapStateToProps = state => ({
    activeProjectId: activeProjectIdFromStateSelector(state),
    activeCountryId: activeCountryIdFromStateSelector(state),
    activeUser: activeUserSelector(state),
    userInformation: currentUserInformationSelector(state),
});

const propTypes = {
    className: PropTypes.string,
    activeCountryId: PropTypes.number,
    activeProjectId: PropTypes.number,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
    userInformation: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    links: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    adminPanelLink: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    activeProjectId: undefined,
    activeCountryId: undefined,
    activeUser: {},
    userInformation: {},
};

@withRouter
@connect(mapStateToProps)
export default class NavDrop extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static dropdownItemIcons = {
        userProfile: 'person',
        stringManagement: 'world',
        projects: 'map',
        countries: 'globe',
        connectors: 'link',
    };

    static getDropItemKey = item => item.key

    static shouldHideLogout = ({ isLoggedIn }) => !isLoggedIn

    renderDropItem = (key, item) => {
        const {
            activeProjectId,
            activeCountryId,
            activeUser = {},
        } = this.props;

        const iconName = NavDrop.dropdownItemIcons[key];

        return (
            <Cloak
                {...item}
                key={key}
                render={
                    <DropItem
                        itemKey={key}
                        iconName={iconName}
                        projectId={activeProjectId}
                        countryId={activeCountryId}
                        userId={activeUser.userId}
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
                className={_cs(styles.dropdownMenu, className)}
                leftComponent={
                    <DisplayPicture
                        className={styles.displayPicture}
                        galleryId={displayPicture}
                    />
                }
                title={userName}
                dropdownClassName={styles.userDropdown}
                closeOnClick
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
                <a
                    className={styles.dropdownItem}
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://chrome.google.com/webstore/detail/deep-2-add-lead/kafonkgglonkbldmcigbdojiadfcmcdc"
                >
                    <Icon
                        className={styles.icon}
                        name="chrome"
                    />
                    <span className={styles.label}>
                        { _ts('pageTitle', 'browserExtension') }
                    </span>
                </a>
                <Cloak
                    hide={NavDrop.shouldHideLogout}
                    render={
                        <LogoutLink
                            onClick={this.props.onLogout}
                        />
                    }
                />
            </DropdownMenu>
        );
    }
}
