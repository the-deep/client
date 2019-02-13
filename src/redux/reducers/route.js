import { isTruthy } from '@togglecorp/fujs';

import createReducerWithMap from '#utils/createReducerWithMap';

import initialRouteState from '../initial-state/route';

// TYPE

export const ROUTE__SET_PARAMS = 'route/SET_PARAMS';
export const ROUTE__CLEAR_STATE = 'route/CLEAR_STATE';

// ACTION-CREATOR

export const setRouteParamsAction = ({ match, location }) => ({
    type: ROUTE__SET_PARAMS,
    match,
    location,
    // params,
});

export const clearRouteStateAction = () => ({
    type: ROUTE__CLEAR_STATE,
});

// REDUCER

const urlValues = [
    'analysisFrameworkId',
    'categoryEditorId',
    'connectorId',
    'countryId',
    'leadGroupId',
    'leadId',
    'projectId',
    'userGroupId',
    'userId',
];

const transform = (params) => {
    const newParams = { ...params };
    urlValues.forEach((urlValue) => {
        if (isTruthy(newParams[urlValue])) {
            newParams[urlValue] = +newParams[urlValue];
        }
    });
    return newParams;
};

const setRouteParams = (state, action) => {
    const { path, url, isExact, params } = action.match;
    const { state: routeState, key } = action.location;

    const isFirstPage = key === undefined;

    const newState = {
        path,
        url,
        isExact,
        params: transform(params),
        routeState,
        // NOTE: once isFirstPage is set to false, it cannot be set to true
        // NOTE: do this because when we use
        // window.location.replace() it clears the key in location
        isFirstPage: state.isFirstPage && isFirstPage,
    };
    return newState;
};

const clearRouteState = (state) => {
    const newState = {
        ...state,
        routeState: {},
    };
    return newState;
};

export const routeReducers = {
    [ROUTE__SET_PARAMS]: setRouteParams,
    [ROUTE__CLEAR_STATE]: clearRouteState,
};

const routeReducer = createReducerWithMap(routeReducers, initialRouteState);
export default routeReducer;
