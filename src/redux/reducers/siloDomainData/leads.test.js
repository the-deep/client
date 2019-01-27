import reducers, {
    L__SET_LEADS,
    L__SET_FILTER,
    L__UNSET_FILTER,
    L__SET_ACTIVE_PAGE,
    L__SET_ACTIVE_SORT,
    L__SET_VIEW,
    setLeadPageFilterAction,
    unsetLeadPageFilterAction,
    setLeadPageActivePageAction,
    setLeadPageActiveSortAction,
    setLeadsAction,
    setLeadPageViewAction,
} from './leads';

test('should set leads filter, clearing old filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                table: { activePage: 2 },
            },
        },
    };

    const action = setLeadPageFilterAction({
        filters: { source: 'tv' },
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { source: 'tv' },
                table: { activePage: 1 },
                grid: { activePage: 1 },
            },
        },
    };

    expect(reducers[L__SET_FILTER](state, action)).toEqual(after);
});

test('should set leads filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };
    const action = setLeadPageFilterAction({
        filters: { source: 'tv' },
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { source: 'tv' },
                table: { activePage: 1 },
                grid: { activePage: 1 },
            },
        },
    };

    expect(reducers[L__SET_FILTER](state, action)).toEqual(after);
});

test('should unset filter', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: { search: 'hari' },
                table: { activePage: 2 },
            },
        },
    };
    const action = unsetLeadPageFilterAction();
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                filter: {},
                table: { activePage: 1 },
                grid: { activePage: 1 },
            },
        },
    };

    expect(reducers[L__UNSET_FILTER](state, action)).toEqual(after);
});

test('should set active page', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                view: 'table',
                filter: { search: 'hari' },
                table: { activePage: 1 },
            },
        },
    };
    const action = setLeadPageActivePageAction({
        activePage: 2,
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                view: 'table',
                filter: { search: 'hari' },
                table: { activePage: 2 },
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_PAGE](state, action)).toEqual(after);
});

test('should set active page for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };
    const action = setLeadPageActivePageAction({
        activePage: 2,
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                table: { activePage: 2 },
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_PAGE](state, action)).toEqual(after);
});

test('should set active sort for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };
    const action = setLeadPageActiveSortAction({
        activeSort: '+created-at',
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                table: {
                    activeSort: '+created-at',
                    activePage: 1,
                },
            },
        },
    };

    expect(reducers[L__SET_ACTIVE_SORT](state, action)).toEqual(after);
});

test('should set leads', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            2: {
                view: 'table',
                filter: { search: 'hari' },
                table: {
                    activePage: 2,
                    activeSort: '-created-at',
                    leads: [],
                },
                totalLeadsCount: 0,
            },
        },
    };
    const action = setLeadsAction({
        leads: ['lead1', 'lead2'],
        totalLeadsCount: 10,
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                view: 'table',
                filter: { search: 'hari' },
                table: {
                    activePage: 2,
                    activeSort: '-created-at',
                    leads: ['lead1', 'lead2'],
                },
                totalLeadsCount: 10,
            },
        },
    };

    expect(reducers[L__SET_LEADS](state, action)).toEqual(after);
});

test('should set leads for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };
    const action = setLeadsAction({
        leads: ['lead1', 'lead2'],
        totalLeadsCount: 10,
    });
    const after = {
        activeProject: 2,
        leadPage: {
            2: {
                table: {
                    leads: ['lead1', 'lead2'],
                },
                totalLeadsCount: 10,
            },
        },
    };

    expect(reducers[L__SET_LEADS](state, action)).toEqual(after);
});

test('should set view', () => {
    const state = {
        activeProject: 2,
        leadPage: {
            view: 'table',
        },
    };
    const action = setLeadPageViewAction({
        view: 'grid',
    });
    const after = {
        activeProject: 2,
        leadPage: {
            view: 'grid',
        },
    };

    expect(reducers[L__SET_VIEW](state, action)).toEqual(after);
});

test('should set view for first time', () => {
    const state = {
        activeProject: 2,
        leadPage: {
        },
    };
    const action = setLeadPageViewAction({
        view: 'table',
    });
    const after = {
        activeProject: 2,
        leadPage: {
            view: 'table',
        },
    };

    expect(reducers[L__SET_VIEW](state, action)).toEqual(after);
});
