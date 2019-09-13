import React from 'react';
import {
    compareString,
    compareDate,
    isValidUrl,
} from '@togglecorp/fujs';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import FormattedDate from '#rscv/FormattedDate';
import _ts from '#ts';

export const xmlConnectorTypes = [
    'rss-feed',
    'atom-feed',
    'emm',
];

export const getFeedUrl = ({ faramValues = {} }) => {
    const { params: { 'feed-url': feedUrl } = {} } = faramValues;
    return feedUrl;
};

export const needToFetchOptions = (sourceKey, connectorDetails) => {
    if (!xmlConnectorTypes.includes(sourceKey)) {
        return false;
    }
    const feedUrl = getFeedUrl(connectorDetails);
    return feedUrl && isValidUrl(feedUrl);
};

export const getUsersTableHeader = (handleToggleUserRoleClick, handleDeleteUserClick) => ([
    {
        key: 'displayName',
        label: _ts('connector', 'tableHeaderName'),
        order: 1,
        sortable: true,
        comparator: (a, b) => compareString(a.displayName, b.displayName),
    },
    {
        key: 'email',
        label: _ts('connector', 'tableHeaderEmail'),
        order: 2,
        sortable: true,
        comparator: (a, b) => compareString(a.email, b.email),
    },
    {
        key: 'role',
        label: _ts('connector', 'tableHeaderRights'),
        order: 3,
        sortable: true,
        comparator: (a, b) => compareString(a.role, b.role),
    },
    {
        key: 'addedAt',
        label: _ts('connector', 'tableHeaderJoinedAt'),
        order: 4,
        sortable: true,
        comparator: (a, b) => compareDate(a.addedAt, b.addedAt),
        modifier: row => (
            <FormattedDate date={row.addedAt} mode="dd-MM-yyyy hh:mm" />
        ),
    },
    {
        key: 'actions',
        label: _ts('connector', 'tableHeaderActions'),
        order: 5,
        modifier: (row) => {
            const isAdmin = row.role === 'admin';
            return (
                <React.Fragment>
                    <PrimaryButton
                        smallVerticalPadding
                        key="role-change"
                        title={
                            isAdmin
                                ? _ts('connector', 'revokeAdminRightsTitle')
                                : _ts('connector', 'grantAdminRightsTitle')
                        }
                        onClick={() => handleToggleUserRoleClick(row)}
                        iconName={isAdmin ? 'locked' : 'person'}
                        transparent
                    />
                    <DangerButton
                        smallVerticalPadding
                        key="delete-member"
                        title={_ts('connector', 'deleteMemberLinkTitle')}
                        onClick={() => handleDeleteUserClick(row)}
                        iconName="delete"
                        transparent
                    />
                </React.Fragment>
            );
        },
    },
]);

export const getProjectsTableHeader = (handleToggleProjectRoleClick, handleDeleteProjectClick) => ([
    {
        key: 'title',
        label: _ts('connector', 'tableHeaderTitle'),
        order: 1,
        sortable: true,
        comparator: (a, b) => compareString(a.title, b.title),
    },
    {
        key: 'role',
        label: _ts('connector', 'tableHeaderVisibility'),
        order: 2,
        sortable: true,
        comparator: (a, b) => compareString(a.role, b.role),
        modifier: (row) => {
            const isGlobal = row.role === 'global';
            if (isGlobal) {
                return _ts('connector', 'globalVisibilityLabel');
            }
            return _ts('connector', 'selfVisibilityLabel');
        },
    },
    {
        key: 'actions',
        label: _ts('connector', 'tableHeaderActions'),
        order: 3,
        modifier: (row) => {
            const isGlobal = row.role === 'global';
            const isProjectAdmin = row.admin === 'admin';
            let toggleTitle = '';
            let deleteTitle = _ts('connector', 'removeProjectTitle');
            if (isGlobal) {
                toggleTitle = _ts('connector', 'setLocalVisibilityTitle');
            } else {
                toggleTitle = _ts('connector', 'setGlobalVisibilityTitle');
            }
            if (!isProjectAdmin) {
                toggleTitle = _ts('connector', 'needAdminRightsTitle');
                deleteTitle = _ts('connector', 'needAdminRightsTitle');
            }

            return (
                <React.Fragment>
                    <PrimaryButton
                        smallVerticalPadding
                        key="role-change"
                        title={toggleTitle}
                        onClick={() => handleToggleProjectRoleClick(row)}
                        iconName={isGlobal ? 'globe' : 'locked'}
                        disabled={!isProjectAdmin}
                        transparent
                    />
                    <DangerButton
                        smallVerticalPadding
                        key="delete-member"
                        title={deleteTitle}
                        onClick={() => handleDeleteProjectClick(row)}
                        iconName="delete"
                        transparent
                    />
                </React.Fragment>
            );
        },
    },
]);
