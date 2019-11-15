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
        key: 'created_by',
        title: _ts('discoverProjects.table', 'createdByTitle'),
        order: 4,
        sortable: true,
    },
    {
        key: 'admins',
        title: _ts('discoverProjects.table', 'adminsTitle'),
        order: 5,
    },
    {
        key: 'analysis_framework',
        title: _ts('discoverProjects.table', 'frameworkTitle'),
        order: 6,
        sortable: true,
    },
    {
        key: 'regions',
        title: _ts('discoverProjects.table', 'regionsTitle'),
        order: 7,
    },
    {
        key: 'number_of_users',
        title: _ts('discoverProjects.table', 'numberOfUsersTitle'),
        order: 8,
    },
    {
        key: 'number_of_leads',
        title: _ts('discoverProjects.table', 'numberOfLeadsTitle'),
        defaultSortOrder: 'dsc',
        order: 9,
        sortable: true,
    },
    {
        key: 'number_of_entries',
        title: _ts('discoverProjects.table', 'numberOfEntriesTitle'),
        defaultSortOrder: 'dsc',
        order: 10,
        sortable: true,
    },
    {
        key: 'leads_activity',
        title: _ts('discoverProjects.table', 'leadsActivityTitle'),
        order: 11,
        sortable: true,
    },
    {
        key: 'entries_activity',
        title: _ts('discoverProjects.table', 'entriesActivityTitle'),
        order: 12,
        sortable: true,
    },
    {
        key: 'status',
        title: _ts('discoverProjects.table', 'statusTitle'),
        order: 13,
        sortable: true,
    },
    {
        key: 'actions',
        title: _ts('discoverProjects.table', 'actionsTitle'),
        order: 13,
    },
];

export default headers;
