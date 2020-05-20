const initialDomainDataState = {
    currentThemeId: 'default',

    // index is project id
    projects: {
        /*
        1: {
        },
        */
    },

    // index is userGroup id
    userGroups: {
        /*
        1: {
            id: 1,
            title: 'Togglecorp',
            rights: 'Admin',
            createdAt: '2017-10-26T04:47:12.381611Z',
            joinedAt: '2017-10-26T04:47:12.381611Z',
            memberships: [],
        },
        */
    },

    categoryEditors: {
        /*
        1: {
            id: 1,
            title: 'Category Editor',
            createdAt: '',
            modifiedAt: '',
            createdBy: 1,
            modifiedBy: 1,
        },
        */
    },

    // index is questionnaire id
    questionnaires: {
        1: {
            id: 1,
            title: 'Venezuela HH Survey 2019 #1',
            numberOfQuestions: 32,
            dateCreated: '2019-02-22',
            crisisType: 'conflict',
            dataCollectionTechnique: 'direct',
            requiredDuration: 35,
            enumeratorSkill: 'basic',
            frameworkId: 495,
        },
        2: {
            id: 2,
            title: 'Venezuela HH Survey 2019 #2',
            numberOfQuestions: 24,
            dateCreated: '2019-01-12',
            crisisType: 'flood',
            dataCollectionTechnique: 'direct',
            requiredDuration: 42,
            enumeratorSkill: 'medium',
            frameworkId: 495,
        },
    },

    analysisFrameworks: {
        /*
        1: {
            id: 1,
            title: 'ACAPS Framework',
            createdAt: '',
            modifiedAt: '',
            createdBy: 1,
            modifiedBy: 1,

            widgets: [
                {
                    id: 1,
                    widgetId: 'excerpt-1xs',
                    title: 'Excerpt',
                    properties: {},
                }
            ],

            filters: [
            ],
            exportables: [
            ],
        },
        */
    },

    // index is project id
    leadFilterOptions: {
        /*
        1: {
        },
        */
    },

    // index is project id
    entryFilterOptions: {
        /*
        1: {
        },
        */
    },

    // index is project id
    aryFilterOptions: {
        /*
        1: {
        },
        */
    },

    // index is project id
    geoOptions: {
        /*
        1: [
        ],
        */
    },

    // index is project id
    regionsForProject: {
        /*
        1: [
        ],
        */
    },

    // index is export id
    userExports: {
        /*
        1: {
        },
        */
    },


    users: {
        /*
        1: {
            information: {
                id: 14,
                username: 'hari@hari.com',
                email: 'hari@hari.com',
                firstName: 'hari',
                lastName: 'hari',
                displayName: 'hari',
                displayPicture: null,
                organization: 'hari',
            },
            projects: [
            ],
            userGroups: [1, 2],
        },
        */
    },

    regions: {
        /*
        1: { id: 1, fullName: 'American Samoa', iso: 'ASM', countryId: 'ASM' },
        */
    },

    adminLevels: {
        // index is project id
        /*
        1: [
            {
                adminLevelId: 1,
                level: 1,
                name: 'Country',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 2,
                level: 2,
                name: 'Zone',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 3,
                level: 3,
                name: 'District',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 4,
                level: 4,
                name: 'GABISA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 5,
                level: 5,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 6,
                level: 6,
                name: 'ABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
            {
                adminLevelId: 7,
                level: 7,
                name: 'HABUSA',
                nameProperty: 'NAME_ENGL',
                parentNameProperty: 'NAME_ENFG',
                parentPcodeProperty: 'NAME_PPCODE',
                pcodeProperty: 'NAME_PCODE',
            },
        ],
        */
    },

    aryTemplates: {
        // index is Ary Template id
        // 1: { },
    },

    connectorSources: {
        // index is connector source
        // 1: {
        //     key: 'rss-feed',
        //     title: 'RSS Feed',
        // },
        // 2: {
        //     key: 'abc-def',
        //     title: 'Abc def',
        // },
    },

    notifications: {
        count: {
            total: 1,
            unseen: 1,
        },
        items: [],
    },
};

export default initialDomainDataState;
