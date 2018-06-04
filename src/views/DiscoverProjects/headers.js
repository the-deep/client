import _ts from '#ts';

const headers = [
    {
        key: 'title',
        title: _ts('discoverProjects.table', 'titleTitle'),
        order: 1,
        sortable: true,
    },
    {
        key: 'description',
        title: _ts('discoverProjects.table', 'descriptionTitle'),
        order: 2,
        sortable: true,
    },
    {
        key: 'createdAt',
        title: _ts('discoverProjects.table', 'createdAtTitle'),
        order: 3,
        sortable: true,
    },
    {
        key: 'admins',
        title: _ts('discoverProjects.table', 'adminsTitle'),
        order: 4,
        sortable: false,
    },
    {
        key: 'analysisFrameworkTitle',
        title: _ts('discoverProjects.table', 'frameworkTitle'),
        order: 5,
        sortable: true,
    },
    {
        key: 'regions',
        title: _ts('discoverProjects.table', 'regionsTitle'),
        order: 6,
        sortable: false,
    },
    {
        key: 'numberOfUsers',
        title: _ts('discoverProjects.table', 'numberOfUsersTitle'),
        order: 7,
        sortable: true,
    },
    {
        key: 'numberOfLeads',
        title: _ts('discoverProjects.table', 'numberOfLeadsTitle'),
        order: 8,
        sortable: true,
    },
    {
        key: 'numberOfEntries',
        title: _ts('discoverProjects.table', 'numberOfEntriesTitle'),
        order: 9,
        sortable: true,
    },
    {
        key: 'activity',
        title: _ts('discoverProjects.table', 'activityTitle'),
        order: 10,
        sortable: false,
    },
    {
        key: 'status',
        title: _ts('discoverProjects.table', 'statusTitle'),
        order: 11,
        sortable: true,
    },
    {
        key: 'actions',
        title: _ts('discoverProjects.table', 'actionsTitle'),
        order: 11,
        sortable: false,
    },
];

export default headers;
