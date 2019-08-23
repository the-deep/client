import reducers, {
    AF__SET_ANALYSIS_FRAMEWORK,
    AF__VIEW_ADD_WIDGET,
    AF__REMOVE_WIDGET,
    AF__VIEW_UPDATE_WIDGET,
    AF__SET_GEO,
    setAfViewAnalysisFrameworkAction,
    addAfViewWidgetAction,
    removeAfViewWidgetAction,
    updateAfViewWidgetAction,
    setAfViewGeoOptionsAction,
} from './analysisFramework';


test('should set analysis framework', () => {
    const state = {
        analysisFrameworkView: { },
    };

    const action = setAfViewAnalysisFrameworkAction({
        analysisFramework: {
            id: 1,
            title: 'af',
        },
    });
    const after = {
        analysisFrameworkView: {
            1: {
                pristine: true,
                data: {
                    id: 1,
                    title: 'af',
                },
                faramValues: {
                    title: 'af',
                    description: undefined,
                },
                faramErrors: {},
            },
        },
    };

    expect(reducers[AF__SET_ANALYSIS_FRAMEWORK](state, action)).toEqual(after);
});

test('should set analysis framework geo options', () => {
    const state = {
        analysisFrameworkView: {
        },
    };

    const action = setAfViewGeoOptionsAction({
        analysisFrameworkId: 1,
        geoOptions: { 1: [] },
    });
    const after = {
        analysisFrameworkView: {
            1: {
                geoOptions: { 1: [] },
            },
        },
    };

    expect(reducers[AF__SET_GEO](state, action)).toEqual(after);
});

test('should add widget', () => {
    const state = {
        analysisFrameworkView: {
            1: {
                data: {},
            },
        },
    };

    const action = addAfViewWidgetAction({
        widget: {
            key: '1',
            title: 'widget1',
            properties: {},
        },
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            1: {
                data: {
                    widgets: [
                        {
                            key: '1',
                            title: 'widget1',
                            properties: {},
                        },
                    ],
                },
                pristine: false,
            },
        },
    };
    expect(reducers[AF__VIEW_ADD_WIDGET](state, action)).toEqual(after);
});

test('should remove widget', () => {
    const state = {
        analysisFrameworkView: {
            1: {
                data: {
                    widgets: [
                        { key: '1', title: 'widget1' },
                        { key: '2', title: 'widget2' },
                    ],
                },
            },
        },
    };
    const action = removeAfViewWidgetAction({
        widgetId: '2',
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            1: {
                data: {
                    widgets: [
                        { key: '1', title: 'widget1' },
                    ],
                },
                pristine: false,
            },
        },
    };
    expect(reducers[AF__REMOVE_WIDGET](state, action)).toEqual(after);
});

test('should update widget', () => {
    const state = {
        analysisFrameworkView: {
            1: {
                data: {
                    widgets: [
                        { key: '1', title: 'widget1' },
                        { key: '2', title: 'widget2' },
                    ],
                },
            },
        },
    };
    const action = updateAfViewWidgetAction({
        widgetKey: '1',
        widgetTitle: 'widget3',
        analysisFrameworkId: 1,
    });
    const after = {
        analysisFrameworkView: {
            1: {
                data: {
                    widgets: [
                        { key: '1', title: 'widget3' },
                        { key: '2', title: 'widget2' },
                    ],
                },
                pristine: false,
            },
        },
    };
    expect(reducers[AF__VIEW_UPDATE_WIDGET](state, action)).toEqual(after);
});
