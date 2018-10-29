import { createSelector } from 'reselect';
import {
    currentUserProjectsSelector,
    projectRolesSelector,
} from '../domainData';

const emptyObject = {};

// FIXME: don't use this as much as possible
export const activeProjectIdFromStateSelector = ({ siloDomainData }) => (
    siloDomainData.activeProject
);

export const activeProjectFromStateSelector = createSelector(
    currentUserProjectsSelector,
    activeProjectIdFromStateSelector,
    (currentUserProjects, activeProject) => (
        currentUserProjects.find(project => project.id === activeProject) || emptyObject
    ),
);

export const activeProjectRoleSelector = createSelector(
    activeProjectFromStateSelector,
    projectRolesSelector,
    (project, roles) => (project.role && roles[project.role]),
);


export const activeCountryIdFromStateSelector = ({ siloDomainData }) => (
    siloDomainData.activeCountry
);
