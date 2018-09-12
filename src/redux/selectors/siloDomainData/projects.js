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


export const projectUserGroupsSelector = createSelector(
    projectSelector,
    project => project.userGroups || emptyArray,
);

export const projectMembershipsSelector = createSelector(
    projectSelector,
    project => project.memberships || emptyArray,
);
