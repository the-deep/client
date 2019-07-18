import { createSelector } from 'reselect';
import {
    userIdFromRoute,
} from '../domainData';

const emptyList = [];
const emptyObject = {};

const userViewSelector = ({ siloDomainData }) => siloDomainData.userView;

const userSelector = createSelector(
    userViewSelector,
    userIdFromRoute,
    (userView, activeUser) => (
        userView[activeUser] || emptyObject
    ),
);

export const userInformationSelector = createSelector(
    userSelector,
    user => user.information || emptyObject,
);

export const userProjectsSelector = createSelector(
    userSelector,
    user => user.projects || emptyList,
);

export const userUserGroupsSelector = createSelector(
    userSelector,
    user => user.usergroups || emptyList,
);
