import { createSelector } from 'reselect';
import { isDefined } from '@togglecorp/fujs';

import { leadKeySelector } from '#views/LeadAdd/utils';

const emptyObject = {};
const emptyArray = [];

const leadAddPageSelector = ({ siloDomainData }) => siloDomainData.leadAddPage || emptyObject;

export const leadAddPageLeadsSelector = createSelector(
    leadAddPageSelector,
    leadAddPage => leadAddPage.leads || emptyArray,
);

export const leadAddPageLeadFiltersSelector = createSelector(
    leadAddPageSelector,
    leadAddPage => leadAddPage.leadFilters || emptyObject,
);

export const leadAddPageLeadPreviewHiddenSelector = createSelector(
    leadAddPageSelector,
    leadAddPage => leadAddPage.leadPreviewHidden,
);

export const leadAddPageActiveLeadKeySelector = createSelector(
    leadAddPageSelector,
    leadAddPage => leadAddPage.activeLeadKey,
);

export const leadAddPageActiveLeadSelector = createSelector(
    leadAddPageLeadsSelector,
    leadAddPageActiveLeadKeySelector,
    (leads, activeLeadKey) => (
        isDefined(activeLeadKey)
            ? leads.find(lead => leadKeySelector(lead) === activeLeadKey)
            : undefined
    ),
);
