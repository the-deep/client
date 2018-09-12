import { createSelector } from 'reselect';
import { projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyArray = [];

const projectViewSelector = ({ siloDomainData }) => siloDomainData.projectsView || emptyObject;

export const projectSelector = createSelector(
    projectViewSelector,
    projectIdFromRoute,
    (projectPage, activeProject) => (
        projectPage[activeProject] || emptyObject
    ),
);

export const projectLocalDataSelector = createSelector(
    projectSelector,
    project => project.localData || emptyObject,
);

export const projectServerDataSelector = createSelector(
    projectSelector,
    project => project.serverData || emptyObject,
);

export const projectFaramValueSelector = createSelector(
    projectLocalDataSelector,
    localdata => localdata.faramValues || emptyObject,
);

// NOTE: there is projectMembershipsSelector, this exists in case some code is still using it
export const projectMembershipDataSelector = createSelector(
    projectFaramValueSelector,
    faramValue => faramValue.memberships || emptyArray,
);

export const projectUserGroupsSelector = createSelector(
    projectFaramValueSelector,
    (faramValue) => {
        console.error(faramValue.userGroups);
        return faramValue.userGroups || emptyArray;
    },
);

export const projectMembershipsSelector = createSelector(
    projectSelector,
    project => project.memberships || emptyArray,
);
