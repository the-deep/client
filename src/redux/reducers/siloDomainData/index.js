import createReducerWithMap from '#utils/createReducerWithMap';

import commonReducers from './common';
import discoverProjectsReducers from './discoverProjects';
import addLeadsReducers from './addLeads';
import analysisFrameworkReducers from './analysisFramework';
import assessmentRegistryReducers from './assessmentRegistry';
import categoryEditorReducers from './categoryEditor';
import editEntriesReducers from './editEntries';
import entriesReducers from './entries';
import leadsReducers from './leads';
import galleryFilesReducers from './galleryFiles';
import visualizationReducers from './visualization';
import editAryReducers from './editAry';
import regionsReducers from './regions';
import connectorsReducers from './connectors';
import notificationsReducers from './notifications';
import stringManagement from './stringManagement';
import leadGroupsReducers from './leadGroups';
import clusterVizReducers from './clusterViz';
import projectsReducers from './projects';
import usersReducers from './users';
import usergroupssReducers from './usergroups';

import initialSiloDomainData from '../../initial-state/siloDomainData';

const reducers = {
    ...addLeadsReducers,
    ...analysisFrameworkReducers,
    ...assessmentRegistryReducers,
    ...categoryEditorReducers,
    ...commonReducers,
    ...editEntriesReducers,
    ...entriesReducers,
    ...leadsReducers,
    ...galleryFilesReducers,
    ...visualizationReducers,
    ...editAryReducers,
    ...regionsReducers,
    ...connectorsReducers,
    ...notificationsReducers,
    ...stringManagement,
    ...leadGroupsReducers,
    ...discoverProjectsReducers,
    ...clusterVizReducers,
    ...projectsReducers,
    ...usersReducers,
    ...usergroupssReducers,
};

const reducer = createReducerWithMap(reducers, initialSiloDomainData);
export default reducer;
