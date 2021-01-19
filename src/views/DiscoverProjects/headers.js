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
        key: 'analysis_framework',
        title: _ts('discoverProjects.table', 'frameworkTitle'),
        order: 5,
        sortable: true,
    },
    {
        key: 'regions',
        title: _ts('discoverProjects.table', 'regionsTitle'),
        order: 6,
    },
    {
        key: 'number_of_users',
        title: _ts('discoverProjects.table', 'numberOfUsersTitle'),
        defaultSortOrder: 'dsc',
        order: 7,
        sortable: true,
    },
    {
        key: 'number_of_leads',
        title: _ts('discoverProjects.table', 'numberOfLeadsTitle'),
        defaultSortOrder: 'dsc',
        order: 8,
        sortable: true,
    },
    {
        key: 'number_of_entries',
        title: _ts('discoverProjects.table', 'numberOfEntriesTitle'),
        defaultSortOrder: 'dsc',
        order: 9,
        sortable: true,
    },
    {
        key: 'leads_activity',
        title: _ts('discoverProjects.table', 'leadsActivityTitle'),
        order: 10,
        defaultSortOrder: 'dsc',
        sortable: true,
    },
    {
        key: 'entries_activity',
        title: _ts('discoverProjects.table', 'entriesActivityTitle'),
        order: 11,
        defaultSortOrder: 'dsc',
        sortable: true,
    },
    {
        key: 'status',
        title: _ts('discoverProjects.table', 'statusTitle'),
        order: 12,
        sortable: true,
    },
    {
        key: 'actions',
        title: _ts('discoverProjects.table', 'actionsTitle'),
        order: 13,
    },
];

export default headers;
