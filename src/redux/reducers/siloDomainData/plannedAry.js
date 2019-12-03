import update from '#rsu/immutable-update';

// TYPE

export const PLANNED_ARY__SET_FILTER = 'siloDomainData/PLANNED_ARY__SET_FILTER';
export const PLANNED_ARY__UNSET_FILTER = 'siloDomainData/PLANNED_ARY__UNSET_FILTER';
export const PLANNED_ARY__SET_ACTIVE_PAGE = 'siloDomainData/PLANNED_ARY__SET_ACTIVE_PAGE';
export const PLANNED_ARY__SET_ACTIVE_SORT = 'siloDomainData/PLANNED_ARY__SET_ACTIVE_SORT';

// ACTION-CREATOR

export const setAryPageFilterAction = ({ filters }) => ({
    type: PLANNED_ARY__SET_FILTER,
    filters,
});

export const unsetAryPageFilterAction = () => ({
    type: PLANNED_ARY__UNSET_FILTER,
});

export const setAryPageActivePageAction = ({ activePage }) => ({
    type: PLANNED_ARY__SET_ACTIVE_PAGE,
    activePage,
});

export const setAryPageActiveSortAction = ({ activeSort }) => ({
    type: PLANNED_ARY__SET_ACTIVE_SORT,
    activeSort,
});

// REDUCER

const plannedAryViewSetFilter = (state, action) => {
    const { filters } = action;
    const { activeProject } = state;
    const settings = {
        plannedAryPage: { $auto: {
            [activeProject]: { $auto: {
                filter: { $set: filters },
                activePage: { $set: 1 },
            } },
        } },
    };
    return update(state, settings);
};

const plannedAryViewUnsetFilter = (state) => {
    const { activeProject } = state;
    const settings = {
        plannedAryPage: {
            [activeProject]: { $auto: {
                filter: { $set: {} },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

const plannedAryViewSetActivePage = (state, action) => {
    const { activePage } = action;
    const { activeProject } = state;
    const settings = {
        plannedAryPage: {
            [activeProject]: { $auto: {
                activePage: { $set: activePage },
            } },
        },
    };
    return update(state, settings);
};

const plannedAryViewSetActiveSort = (state, action) => {
    const { activeSort } = action;
    const { activeProject } = state;

    const settings = {
        plannedAryPage: {
            [activeProject]: { $auto: {
                activeSort: { $set: activeSort },
                activePage: { $set: 1 },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [PLANNED_ARY__SET_FILTER]: plannedAryViewSetFilter,
    [PLANNED_ARY__UNSET_FILTER]: plannedAryViewUnsetFilter,
    [PLANNED_ARY__SET_ACTIVE_PAGE]: plannedAryViewSetActivePage,
    [PLANNED_ARY__SET_ACTIVE_SORT]: plannedAryViewSetActiveSort,
};

export default reducers;
