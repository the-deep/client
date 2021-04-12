import createReducerWithMap from '#utils/createReducerWithMap';

import commonReducers from './common';
import discoverProjectsReducers from './discoverProjects';
import analysisFrameworkReducers from './analysisFramework';
import assessmentRegistryReducers from './assessmentRegistry';
import plannedAryReducers from './plannedAry';
import categoryEditorReducers from './categoryEditor';
import editEntriesReducers from './editEntries';
import editPillarAnalysisReducers from './editPillarAnalysis';
import entriesReducers from './entries';
import leadsReducers from './leads';
import galleryFilesReducers from './galleryFiles';
import visualizationReducers from './visualization';
import editAryReducers from './editAry';
import regionsReducers from './regions';
import connectorsReducers from './connectors';
import stringManagement from './stringManagement';
import leadGroupsReducers from './leadGroups';
import clusterVizReducers from './clusterViz';
import projectsReducers from './projects';
import usersReducers from './users';
import usergroupssReducers from './usergroups';
import tabularReducers from './tabular';
import leadAddReducers from './leadAdd';

import initialSiloDomainData from '../../initial-state/siloDomainData';

const reducers = {
    ...analysisFrameworkReducers,
    ...assessmentRegistryReducers,
    ...plannedAryReducers,
    ...categoryEditorReducers,
    ...commonReducers,
    ...editEntriesReducers,
    ...editPillarAnalysisReducers,
    ...entriesReducers,
    ...leadsReducers,
    ...galleryFilesReducers,
    ...visualizationReducers,
    ...editAryReducers,
    ...regionsReducers,
    ...connectorsReducers,
    ...stringManagement,
    ...leadGroupsReducers,
    ...discoverProjectsReducers,
    ...clusterVizReducers,
    ...projectsReducers,
    ...usersReducers,
    ...usergroupssReducers,
    ...tabularReducers,
    ...leadAddReducers,
};

const reducer = createReducerWithMap(reducers, initialSiloDomainData);
export default reducer;
