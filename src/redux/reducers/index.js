import { persistCombineReducers } from 'redux-persist';

import storeConfig from '#config/store';

import authReducer from './auth';
import notifyReducer from './notify';
import routeReducer from './route';
import domainDataReducer from './domainData';
import langReducer from './lang';
import appReducer from './app';
import siloDomainDataReducer from './siloDomainData';

const reducers = {
    notify: notifyReducer,
    route: routeReducer,
    auth: authReducer,
    lang: langReducer,
    app: appReducer,
    domainData: domainDataReducer,
    siloDomainData: siloDomainDataReducer,
};

const reducer = persistCombineReducers(storeConfig, reducers);
export default reducer;
