import createReducerWithMap from '#utils/createReducerWithMap';

import analysisFrameworksReducers from './analysisFrameworks';
import categoryEditorsReducers from './categoryEditors';
import assessmentRegistryReducers from './assessmentRegistry';
import leadFilterReducers from './leadFilter';
import entryFilterReducers from './entryFilter';
import projectsReducers from './projects';
import regionsReducers from './regions';
import userGroupsReducers from './userGroups';
import usersReducers from './users';
import connectorReducers from './connectors';
import commonReducers from './common';
import pagesInfo from './pagesInfo';
import notifications from './notifications';
import userConfig from './userConfig';

import initialDomainData from '../../initial-state/domainData';

const reducers = {
    ...analysisFrameworksReducers,
    ...categoryEditorsReducers,
    ...assessmentRegistryReducers,
    ...leadFilterReducers,
    ...entryFilterReducers,
    ...projectsReducers,
    ...regionsReducers,
    ...userGroupsReducers,
    ...usersReducers,
    ...commonReducers,
    ...connectorReducers,
    ...pagesInfo,
    ...notifications,
    ...userConfig,
};

const reducer = createReducerWithMap(reducers, initialDomainData);
export default reducer;
