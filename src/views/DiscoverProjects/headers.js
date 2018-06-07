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
        key: 'created_at',
        title: _ts('discoverProjects.table', 'createdAtTitle'),
        order: 3,
        sortable: true,
    },
    {
        key: 'admins',
        title: _ts('discoverProjects.table', 'adminsTitle'),
        order: 4,
    },
    {
        key: 'analysis_framework_title',
        title: _ts('discoverProjects.table', 'frameworkTitle'),
        order: 5,
    },
    {
        key: 'regions',
        title: _ts('discoverProjects.table', 'regionsTitle'),
        order: 6,
    },
    {
        key: 'number_of_users',
        title: _ts('discoverProjects.table', 'numberOfUsersTitle'),
        order: 7,
    },
    {
        key: 'number_of_leads',
        title: _ts('discoverProjects.table', 'numberOfLeadsTitle'),
        order: 8,
    },
    {
        key: 'number_of_entries',
        title: _ts('discoverProjects.table', 'numberOfEntriesTitle'),
        order: 9,
    },
    {
        key: 'activity',
        title: _ts('discoverProjects.table', 'activityTitle'),
        order: 10,
    },
    {
        key: 'status',
        title: _ts('discoverProjects.table', 'statusTitle'),
        order: 11,
    },
    {
        key: 'actions',
        title: _ts('discoverProjects.table', 'actionsTitle'),
        order: 11,
    },
];

export default headers;
