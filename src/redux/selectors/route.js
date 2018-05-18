import { createSelector } from 'reselect';
import { isFalsy } from '../../vendor/react-store/utils/common';

const emptyObject = {};

export const routeUrlSelector = ({ route }) => (
    route.url
);

export const propsSelector = (state, props) => props;

export const routeParamsSelector = ({ route }) => (
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
