import update from '#rsu/immutable-update';

// TYPE

export const L__SET_LEADS = 'siloDomainData/SET_LEADS';
export const L__APPEND_LEADS = 'siloDomainData/APPEND_LEADS';
export const L__PATCH_LEAD = 'siloDomainData/PATCH_LEAD';
export const L__REMOVE_LEAD = 'siloDomainData/REMOVE_LEAD';

export const L__SET_FILTER = 'siloDomainData/SET_FILTER';
export const L__UNSET_FILTER = 'siloDomainData/UNSET_FILTER';

export const L__SET_ACTIVE_PAGE = 'siloDomainData/SET_LEAD_PAGE_ACTIVE_PAGE';
export const L__SET_ACTIVE_SORT = 'siloDomainData/SET_LEAD_PAGE_ACTIVE_SORT';
export const L__SET_LEADS_PER_PAGE = 'siloDomainData/SET_LEADS_PER_PAGE';
export const L__SET_VIEW = 'siloDomainData/SET_LEAD_PAGE_VIEW';

// ACTION-CREATOR

export const setLeadPageFilterAction = ({ filters }) => ({
    type: L__SET_FILTER,
    filters,
});

export const unsetLeadPageFilterAction = () => ({
    type: L__UNSET_FILTER,
});

export const setLeadPageActivePageAction = ({ activePage }) => ({
    type: L__SET_ACTIVE_PAGE,
    activePage,
});

export const setLeadPageActiveSortAction = ({ activeSort }) => ({
    type: L__SET_ACTIVE_SORT,
    activeSort,
});

export const setLeadPageViewAction = ({ view }) => ({
    type: L__SET_VIEW,
    view,
});

export const setLeadPageLeadsPerPageAction = ({ leadsPerPage }) => ({
    type: L__SET_LEADS_PER_PAGE,
    leadsPerPage,
});

export const setLeadsAction = ({ leads, totalLeadsCount }) => ({
    type: L__SET_LEADS,
    leads,
    totalLeadsCount,
});

export const appendLeadsAction = ({ leads, totalLeadsCount }) => ({
    type: L__APPEND_LEADS,
    leads,
    totalLeadsCount,
});

export const patchLeadAction = ({ lead }) => ({
    type: L__PATCH_LEAD,
    lead,
});

export const removeLeadAction = ({ lead }) => ({
    type: L__REMOVE_LEAD,
    lead,
});

const getView = (state) => {
    const { activeProject } = state;
    if (activeProject && state.leadPage[activeProject]) {
        const { view = 'table' } = state.leadPage[activeProject];
        return view;
    }

    return 'table';
};

// REDUCER

const leadViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                table: { $auto: {
                    activePage: { $set: 1 },
                } },
                grid: { $auto: {
                    activePage: { $set: 1 },
                } },
                filter: { $set: filters },
            } },
        },
    };
    return update(state, settings);
};

const leadViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                table: { $auto: {
                    activePage: { $set: 1 },
                } },
                grid: { $auto: {
                    activePage: { $set: 1 },
                } },
            } },
        },
    };
    return update(state, settings);
};

const leadViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const view = getView(state);
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                [view]: { $auto: {
                    activePage: { $set: activePage },
                } },
            } },
        },
    };
    return update(state, settings);
};

const leadViewSetActiveSort = (state, action) => {
    const { activeSort } = action;
    const { activeProject } = state;
    const view = getView(state);
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                [view]: { $auto: {
                    activeSort: { $set: activeSort },
                    activePage: { $set: 1 },
                } },
            } },
        },
    };
    return update(state, settings);
};

const leadViewSetView = (state, action) => {
    const { view } = action;
    const { activeProject } = state;
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                view: { $set: view },
            } },
        },
    };
    return update(state, settings);
};

const leadViewSetLeadsPerPage = (state, action) => {
    const { leadsPerPage } = action;
    const { activeProject } = state;
    const view = getView(state);
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                [view]: { $auto: {
                    leadsPerPage: { $set: leadsPerPage },
                    activePage: { $set: 1 },
                } },
            } },
        },
    };
    return update(state, settings);
};

const setLeads = (state, action) => {
    const { activeProject } = state;
    const { leads, totalLeadsCount } = action;
    const view = getView(state);
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                [view]: { $auto: {
                    leads: { $set: leads },
                } },
                totalLeadsCount: { $set: totalLeadsCount },
            } },
        },
    };
    return update(state, settings);
};

const appendLeads = (state, action) => {
    const { activeProject } = state;
    const { leads, totalLeadsCount } = action;
    const view = getView(state);
    const settings = {
        leadPage: {
            [activeProject]: { $auto: {
                [view]: { $auto: {
                    leads: { $push: leads },
                } },
                totalLeadsCount: { $set: totalLeadsCount },
            } },
        },
    };
    return update(state, settings);
};

const removeLead = (state, action) => {
    const { activeProject } = state;
    const { lead } = action;
    const { totalLeadsCount } = state.leadPage[activeProject];
    const settings = {
        leadPage: {
            [activeProject]: {
                table: {
                    leads: { $filter: ld => ld.id !== lead.id },
                },
                grid: {
                    leads: { $filter: ld => ld.id !== lead.id },
                },
                totalLeadsCount: { $set: totalLeadsCount - 1 },
            },
        },
    };
    return update(state, settings);
};

const patchLead = (state, action) => {
    const { activeProject, leadPage } = state;
    const { lead } = action;

    const tableIndex = leadPage[activeProject].table.leads.findIndex(ld => ld.id === lead.id);
    const gridIndex = leadPage[activeProject].grid.leads.findIndex(ld => ld.id === lead.id);
    const settings = {
        leadPage: {
            [activeProject]: {
                table: {
                    leads: { $splice: [[tableIndex, 1, lead]] },
                },
                grid: {
                    leads: { $splice: [[gridIndex, 1, lead]] },
                },
            },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [L__SET_FILTER]: leadViewSetFilter,
    [L__UNSET_FILTER]: leadViewUnsetFilter,
    [L__SET_ACTIVE_PAGE]: leadViewSetActivePage,
    [L__SET_ACTIVE_SORT]: leadViewSetActiveSort,
    [L__SET_LEADS_PER_PAGE]: leadViewSetLeadsPerPage,
    [L__SET_VIEW]: leadViewSetView,

    [L__SET_LEADS]: setLeads,
    [L__APPEND_LEADS]: appendLeads,
    [L__PATCH_LEAD]: patchLead,
    [L__REMOVE_LEAD]: removeLead,
};

export default reducers;
