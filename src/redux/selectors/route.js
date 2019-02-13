import { createSelector } from 'reselect';
import { isFalsy, getFirstKeyByValue } from '@togglecorp/fujs';
import { pathNames } from '#constants/routes';

const emptyObject = {};

export const routeUrlSelector = ({ route }) => (
    route.url
);

const routePathSelector = ({ route }) => (
    route.path
);

export const routeIsFirstPageSelector = ({ route }) => (
    route.isFirstPage
);

export const routePathKeySelector = createSelector(
    routePathSelector,
    path => getFirstKeyByValue(pathNames, path),
);

const propsSelector = (state, props) => props;

const routeParamsSelector = ({ route }) => (
    route.params || emptyObject
);

export const routeStateSelector = ({ route }) => (
    route.routeState || emptyObject
);

const createRouteSelector = name => createSelector(
    propsSelector,
    routeParamsSelector,
    (props, routeParams) => {
        if (!isFalsy(props) && !isFalsy(props[name])) {
            return props[name];
        }
        return routeParams[name];
    },
);

export const afIdFromRouteSelector = createRouteSelector('analysisFrameworkId');
export const ceIdFromRouteSelector = createRouteSelector('categoryEditorId');
export const connectorIdFromRouteSelector = createRouteSelector('connectorId');
export const countryIdFromRouteSelector = createRouteSelector('countryId');
export const groupIdFromRouteSelector = createRouteSelector('userGroupId');
export const leadIdFromRouteSelector = createRouteSelector('leadId');
export const leadGroupIdFromRouteSelector = createRouteSelector('leadGroupId');
export const projectIdFromRouteSelector = createRouteSelector('projectId');
export const userIdFromRouteSelector = createRouteSelector('userId');
