import { createSelector } from 'reselect';
import {
    groupIdFromRoute,
    activeUserSelector,
} from '#redux';

const emptyList = [];
const emptyObject = {};

const usergroupViewSelector = ({ siloDomainData }) => siloDomainData.usergroupView;

const usergroupSelector = createSelector(
    usergroupViewSelector,
    groupIdFromRoute,
    (usergroupView, activeUsergroup) => (
        usergroupView[activeUsergroup] || emptyObject
    ),
);

export const usergroupInformationSelector = createSelector(
    usergroupSelector,
    usergroup => usergroup.information || emptyObject,
);

export const usergroupProjectsSelector = createSelector(
    usergroupSelector,
    usergroup => usergroup.projects || emptyList,
);

export const usergroupMembershipsSelector = createSelector(
    usergroupSelector,
    usergroup => usergroup.memberships || emptyList,
);

export const isCurrentUserAdminOfCurrentUsergroup = createSelector(
    usergroupMembershipsSelector,
    activeUserSelector,
    (memberships, activeUser) => (
        memberships.findIndex(member => (
            member.role === 'admin' && member.member === activeUser.userId
        )) !== -1
    ),
);
