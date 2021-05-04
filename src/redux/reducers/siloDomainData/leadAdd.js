import produce from 'immer';

import {
    getDefinedElementAround,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    analyzeErrors,
    accumulateDifferentialErrors,
} from '@togglecorp/faram';

import {
    leadIdSelector,
    leadKeySelector,
    leadFaramErrorsSelector,
    leadFaramValuesSelector,
} from '#views/LeadAdd/utils';
import schema from '#views/LeadAdd/LeadDetail/faramSchema';

export const LA__SET_LEAD_PREVIEW_HIDDEN = 'siloDomainData/LA__SET_LEAD_PREVIEW_HIDDEN';
export const LA__SET_LEAD_FILTERS = 'siloDomainData/LA__SET_LEAD_FILTERS';
export const LA__CLEAR_LEAD_FILTERS = 'siloDomainData/LA__CLEAR_LEAD_FILTERS';
export const LA__SET_ACTIVE_LEAD_KEY = 'siloDomainData/LA__SET_ACTIVE_LEAD_KEY';
export const LA__NEXT_LEAD = 'siloDomainData/LA__NEXT_LEAD';
export const LA__PREV_LEAD = 'siloDomainData/LA__PREV_LEAD';
export const LA__APPEND_LEADS = 'siloDomainData/LA__APPEND_LEADS';
export const LA__REMOVE_LEADS = 'siloDomainData/LA__REMOVE_LEADS';
export const LA__SET_LEAD_TABULAR_BOOK = 'siloDomainData/LA__SET_LEAD_TABULAR_BOOK';
export const LA__SET_LEAD_ATTACHMENT = 'siloDomainData/LA__SET_LEAD_ATTACHMENT';
export const LA__CHANGE_LEAD = 'siloDomainData/LA__CHANGE_LEAD';
export const LA__SAVE_LEAD = 'siloDomainData/LA__SAVE_LEAD';
export const LA__APPLY_LEADS_ALL_BELOW = 'siloDomainData/LA__APPLY_LEADS_ALL_BELOW';
export const LA__APPLY_LEADS_ALL = 'siloDomainData/LA__APPLY_LEADS_ALL';

export const leadAddSetLeadPreviewHiddenAction = value => ({
    type: LA__SET_LEAD_PREVIEW_HIDDEN,
    value,
});

export const leadAddSetLeadFiltersAction = filters => ({
    type: LA__SET_LEAD_FILTERS,
    filters,
});

export const leadAddClearLeadFiltersAction = () => ({
    type: LA__CLEAR_LEAD_FILTERS,
});

export const leadAddSetActiveLeadKeyAction = leadKey => ({
    type: LA__SET_ACTIVE_LEAD_KEY,
    leadKey,
});

export const leadAddNextLeadAction = () => ({
    type: LA__NEXT_LEAD,
});

export const leadAddPrevLeadAction = () => ({
    type: LA__PREV_LEAD,
});

export const leadAddRemoveLeadsAction = leadKeys => ({
    type: LA__REMOVE_LEADS,
    leadKeys,
});

// TODO: not tested
export const leadAddSetLeadTabularBookAction = ({ leadKey, tabularBook }) => ({
    type: LA__SET_LEAD_TABULAR_BOOK,
    leadKey,
    tabularBook,
});

export const leadAddSetLeadAttachmentAction = ({ leadKey, attachment }) => ({
    type: LA__SET_LEAD_ATTACHMENT,
    leadKey,
    attachment,
});

export const leadAddChangeLeadAction = ({ leadKey, faramValues, faramErrors }) => ({
    type: LA__CHANGE_LEAD,
    leadKey,
    faramValues,
    faramErrors,
});

export const leadAddSaveLeadAction = ({ leadKey, lead }) => ({
    type: LA__SAVE_LEAD,
    leadKey,
    lead,
});

export const leadAddAppendLeadsAction = leads => ({
    type: LA__APPEND_LEADS,
    leads,
});

export const leadAddApplyLeadsAllBelowAction = ({ leadKey, values, attrName, attrValue }) => ({
    type: LA__APPLY_LEADS_ALL_BELOW,
    leadKey,
    values,
    attrName,
    attrValue,
});

export const leadAddApplyLeadsAllAction = ({ leadKey, values, attrName, attrValue }) => ({
    type: LA__APPLY_LEADS_ALL,
    leadKey,
    values,
    attrName,
    attrValue,
});

const emptyArray = [];

function findLeadIndex(leads, activeLeadKey) {
    if (leads.length <= 0 || isNotDefined(activeLeadKey)) {
        return -1;
    }
    const index = leads.findIndex(lead => activeLeadKey === leadKeySelector(lead));
    return index;
}

// REDUCER MAP

const setLeadPreviewHidden = (state, action) => {
    const { value } = action;
    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leadPreviewHidden = value;
    });
    return newState;
};

const setLeadFilters = (state, action) => {
    const { filters } = action;
    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leadFilters = filters;
    });
    return newState;
};

const clearLeadFilters = (state) => {
    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leadFilters = {};
    });
    return newState;
};

const setActiveLeadKey = (state, action) => {
    const { leadKey } = action;
    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.activeLeadKey = leadKey;
    });
    return newState;
};

const nextLead = (state) => {
    const {
        leadAddPage: {
            leads = emptyArray,
            activeLeadKey,
        } = {},
    } = state;

    const index = findLeadIndex(leads, activeLeadKey);
    if (index === -1 || index === leads.length - 1) {
        return state;
    }

    const newLead = leads[index + 1];
    const newLeadKey = leadKeySelector(newLead);

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.activeLeadKey = newLeadKey;
    });
    return newState;
};

const prevLead = (state) => {
    const {
        leadAddPage: {
            leads = emptyArray,
            activeLeadKey,
        } = {},
    } = state;

    const index = findLeadIndex(leads, activeLeadKey);
    if (index === -1 || index === 0) {
        return state;
    }

    const newLead = leads[index - 1];
    const newLeadKey = leadKeySelector(newLead);

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.activeLeadKey = newLeadKey;
    });
    return newState;
};

const appendLeads = (state, action) => {
    const {
        leadAddPage: {
            leads: oldLeads = emptyArray,
        } = {},
    } = state;
    const { leads } = action;

    const serverIdMapping = listToMap(
        oldLeads.filter(leadIdSelector),
        leadIdSelector,
        () => true,
    );

    // NOTE: Do not add new lead if there is already a lead with same serverId
    const filteredLeads = leads.filter(
        (lead) => {
            const leadId = leadIdSelector(lead);
            return !serverIdMapping[leadId];
        },
    );

    if (filteredLeads.length <= 0) {
        // TODO: we should set active lead anyway
        return state;
    }

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        safeState.leadAddPage.leads.unshift(...filteredLeads);

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.activeLeadKey = leadKeySelector(
            filteredLeads[filteredLeads.length - 1],
        );
    });
    return newState;
};

const removeLeads = (state, action) => {
    const {
        leadAddPage: {
            leads = emptyArray,
            activeLeadKey,
        } = {},
    } = state;
    const { leadKeys } = action;

    const leadKeysMapping = listToMap(
        leadKeys,
        item => item,
        () => true,
    );

    const mappedLeads = leads.map(
        lead => (leadKeysMapping[leadKeySelector(lead)] ? undefined : lead),
    );

    const filteredLeads = mappedLeads.filter(isDefined);

    const shouldUpdateActiveLeadKey = (
        isNotDefined(activeLeadKey)
        || !filteredLeads.find(lead => leadKeySelector(lead) === activeLeadKey)
    );

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads = filteredLeads;

        if (shouldUpdateActiveLeadKey) {
            const leadIndex = leads.findIndex(
                lead => leadKeySelector(lead) === activeLeadKey,
            );
            const newActiveLead = getDefinedElementAround(mappedLeads, leadIndex);
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.activeLeadKey = newActiveLead
                ? leadKeySelector(newActiveLead)
                : undefined;
        }
    });
    return newState;
};

const setLeadTabularBook = (state, action) => {
    const {
        leadKey,
        tabularBook,
    } = action;
    const {
        leadAddPage: {
            leads = emptyArray,
        } = {},
    } = state;
    const index = findLeadIndex(leads, leadKey);
    if (index === -1) {
        console.error(`Lead with key ${leadKey} not found.`);
        return state;
    }

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramValues.tabularBook = tabularBook;
    });

    return newState;
};

const setLeadAttachment = (state, action) => {
    const {
        leadKey,
        attachment,
    } = action;
    const {
        leadAddPage: {
            leads = emptyArray,
        } = {},
    } = state;
    const index = findLeadIndex(leads, leadKey);
    if (index === -1) {
        console.error(`Lead with key ${leadKey} not found.`);
        return state;
    }

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramValues.attachment = attachment;
    });

    return newState;
};

const changeLead = (state, action) => {
    const {
        leadKey,
        faramValues,
        faramErrors,
    } = action;
    const {
        leadAddPage: {
            leads = emptyArray,
        } = {},
    } = state;

    const index = findLeadIndex(leads, leadKey);
    if (index === -1) {
        console.error(`Lead with key ${leadKey} not found.`);
        return state;
    }

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        if (isDefined(faramValues)) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[index].faramValues = faramValues;
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[index].faramInfo.pristine = false;
        }

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramErrors = faramErrors;

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramInfo.error = analyzeErrors(faramErrors);
    });
    return newState;
};

const saveLead = (state, action) => {
    const {
        leadKey,
        lead,
    } = action;
    const {
        leadAddPage: {
            leads = emptyArray,
        } = {},
    } = state;

    const index = findLeadIndex(leads, leadKey);
    if (index === -1) {
        console.error(`Lead with key ${leadKey} not found.`);
        return state;
    }

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].serverId = lead.id;

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramErrors = {};

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramInfo.pristine = true;

        // eslint-disable-next-line no-param-reassign
        safeState.leadAddPage.leads[index].faramInfo.error = false;
    });
    return newState;
};

const applyLeads = behavior => (state, action) => {
    const {
        leadKey,
        values,
        attrName,
        attrValue,
    } = action;

    const newState = produce(state, (safeState) => {
        if (!safeState.leadAddPage) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage = {};
        }
        if (!safeState.leadAddPage.leads) {
            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads = [];
        }

        const leadIndex = safeState.leadAddPage.leads.findIndex(
            lead => leadKeySelector(lead) === leadKey,
        );
        const start = (behavior === 'below') ? (leadIndex + 1) : 0;
        for (let i = start; i < safeState.leadAddPage.leads.length; i += 1) {
            const oldFaramValues = leadFaramValuesSelector(safeState.leadAddPage.leads[i]);
            const oldFaramErrors = leadFaramErrorsSelector(safeState.leadAddPage.leads[i]);

            if (
                (
                    values.project === undefined
                    || oldFaramValues.project === undefined
                    || oldFaramValues.project !== values.project
                ) && (
                    attrName === 'assignee'
                    || attrName === 'leadGroup'
                )
            ) {
                // eslint-disable-next-line no-continue
                continue;
            }

            if (oldFaramValues[attrName] === attrValue) {
                // eslint-disable-next-line no-continue
                continue;
            }

            const newFaramValues = {
                ...oldFaramValues,
                [attrName]: attrValue,
            };

            const newFaramErrors = accumulateDifferentialErrors(
                oldFaramValues,
                newFaramValues,
                oldFaramErrors,
                schema,
            );

            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[i].faramValues = newFaramValues;

            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[i].faramErrors = newFaramErrors;

            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[i].faramInfo.pristine = false;

            // eslint-disable-next-line no-param-reassign
            safeState.leadAddPage.leads[i].faramInfo.error = analyzeErrors(newFaramErrors);
        }
    });
    return newState;
};

const reducers = {
    [LA__SET_LEAD_PREVIEW_HIDDEN]: setLeadPreviewHidden,
    [LA__SET_LEAD_FILTERS]: setLeadFilters,
    [LA__CLEAR_LEAD_FILTERS]: clearLeadFilters,
    [LA__SET_ACTIVE_LEAD_KEY]: setActiveLeadKey,
    [LA__NEXT_LEAD]: nextLead,
    [LA__PREV_LEAD]: prevLead,
    [LA__APPEND_LEADS]: appendLeads,
    [LA__REMOVE_LEADS]: removeLeads,
    [LA__SET_LEAD_TABULAR_BOOK]: setLeadTabularBook,
    [LA__SET_LEAD_ATTACHMENT]: setLeadAttachment,
    [LA__CHANGE_LEAD]: changeLead,
    [LA__SAVE_LEAD]: saveLead,
    [LA__APPLY_LEADS_ALL_BELOW]: applyLeads('below'),
    [LA__APPLY_LEADS_ALL]: applyLeads('all'),
};

export default reducers;
