import { createSelector } from 'reselect';
import { isDefined } from '@togglecorp/fujs';

import {
    leadKeySelector,
    leadSourceTypeSelector,
    LEAD_TYPE,
} from '#views/LeadAdd/utils';

import { projectIdFromRoute } from '../domainData';

const emptyObject = {};
const emptyArray = [];

const leadAddPageSelector = ({ siloDomainData }) => siloDomainData.leadAddPage;

const leadAddPageForProjectSelector = createSelector(
    leadAddPageSelector,
    projectIdFromRoute,
    (leadPage, activeProject) => (
        leadPage[activeProject] ?? emptyObject
    ),
);

export const leadAddPageLeadsSelector = createSelector(
    leadAddPageForProjectSelector,
    leadAddPage => leadAddPage?.leads ?? emptyArray,
);

export const leadAddPageLeadFiltersSelector = createSelector(
    leadAddPageForProjectSelector,
    leadAddPage => leadAddPage?.leadFilters ?? emptyObject,
);

export const leadAddPageLeadPreviewHiddenSelector = createSelector(
    leadAddPageForProjectSelector,
    leadAddPage => leadAddPage?.leadPreviewHidden,
);

export const leadAddPageActiveLeadKeySelector = createSelector(
    leadAddPageForProjectSelector,
    leadAddPage => leadAddPage?.activeLeadKey,
);

export const leadAddPageActiveSourceSelector = createSelector(
    leadAddPageForProjectSelector,
    leadAddPage => leadAddPage?.activeSource ?? LEAD_TYPE.text,
);

export const leadAddPageActiveSourceLeadsSelector = createSelector(
    leadAddPageLeadsSelector,
    leadAddPageActiveSourceSelector,
    (leads, activeSource) => leads.filter(lead => leadSourceTypeSelector(lead) === activeSource),
);

export const leadAddPageActiveLeadSelector = createSelector(
    leadAddPageActiveSourceLeadsSelector,
    leadAddPageActiveLeadKeySelector,
    (leads, activeLeadKey) => (
        isDefined(activeLeadKey)
            ? leads.find(lead => leadKeySelector(lead) === activeLeadKey)
            : undefined
    ),
);
