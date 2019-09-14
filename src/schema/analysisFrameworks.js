const analysisFrameworkSchema = [];

{
    const name = 'analysisFramework';
    const schema = {
        doc: {
            name: 'Analysis Framework',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            title: { type: 'string', required: true },
            widgets: { type: 'array.Widget' },
            exportables: { type: 'array.Exportable' },
            filters: { type: 'array.Filter' },
            members: { type: 'array.uint' },
            role: {
                type: {
                    name: 'mapping of role',
                    fields: {
                        '*': {
                            type: {
                                id: { type: 'uint', required: true },
                                title: { type: 'string', required: true },
                                canAddUser: { type: 'boolean', required: true },
                                canCloneFramework: { type: 'boolean', required: true },
                                canEditFramework: { type: 'boolean', required: true },
                                canUserInOtherProjects: { type: 'boolean', required: true },
                            },
                            required: true,
                        },
                    },
                },
                required: true,
            },
            properties: { type: 'unknown', required: false },
            isAdmin: { type: 'boolean', required: true },
            isPrivate: { type: 'boolean', required: true },
            description: { type: 'string' },
            entriesCount: { type: 'uint', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'analysisFrameworkView';
    const schema = {
        doc: {
            name: 'Analysis Framework',
            description: 'One of the main entities',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            description: { type: 'string' },
            widgets: { type: 'array.Widget' },
            members: { type: 'array.uint' },
            role: {
                type: {
                    name: 'mapping of role',
                    fields: {
                        '*': {
                            type: {
                                id: { type: 'uint', required: true },
                                title: { type: 'string', required: true },
                                canAddUser: { type: 'boolean', required: true },
                                canCloneFramework: { type: 'boolean', required: true },
                                canEditFramework: { type: 'boolean', required: true },
                                canUserInOtherProjects: { type: 'boolean', required: true },
                            },
                            required: true,
                        },
                    },
                },
                required: true,
            },
            isPrivate: { type: 'boolean', required: true },
            entriesCount: { type: 'uint', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'analysisFrameworkList';
    const schema = {
        doc: {
            name: 'Analysis Frameworks list',
            description: 'One of the main entities',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.analysisFramework', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Widget';
    const schema = {
        doc: {
            name: 'Widget',
            description: 'Widget contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            title: { type: 'string', required: true },
            key: { type: 'string' },
            widgetId: { type: 'string', required: true },
            properties: { type: 'object' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Exportable';
    const schema = {
        doc: {
            name: 'Exportable',
            description: 'Exportable contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            widgetKey: { type: 'string', required: true },
            inline: { type: 'boolean' },
            order: { type: 'uint' },
            data: { type: 'object' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'Filter';
    const schema = {
        doc: {
            name: 'Filter',
            description: 'Filter contained in analysis framework',
        },
        fields: {
            id: { type: 'uint', required: 'true' },
            key: { type: 'string', required: true },
            widgetKey: { type: 'string', required: true },
            title: { type: 'string', required: true },
            properties: { type: 'object' },
            filterType: { type: 'string' }, // enum: list, number
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

{
    const name = 'analysisFrameworkTitle';
    const schema = {
        doc: {
            name: 'Analysis Framework Title',
            description: 'Title for Analysis Framework',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            isPrivate: { type: 'boolean', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}
{
    const name = 'analysisFrameworkTitleList';
    const schema = {
        doc: {
            name: 'Project Analysis Framework List',
            description: 'List Analysis Frameworks for listing in project panel',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.analysisFrameworkTitle', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

{
    const name = 'frameworkMembership';
    const schema = {
        doc: {
            name: {
                name: 'Framework membership unit',
            },
            fields: {
                id: { type: 'uint', required: true },
                member: { type: 'uint', required: true },
                role: { type: 'uint', required: true },
                memberDetails: { type: 'object', required: true },
            },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

{
    const name = 'frameworkMembersList';
    const schema = {
        doc: {
            name: 'Frameworks members list',
            description: 'List of framework members',
        },
        fields: {
            results: { type: 'array.frameworkMembership', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

{
    const name = 'frameworkRole';
    const schema = {
        doc: {
            name: 'Frameworks role',
            description: 'Framework roles',
        },
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            canAddUser: { type: 'boolean', required: true },
            canCloneFramework: { type: 'boolean', required: true },
            canUseInOtherProjects: { type: 'boolean', required: true },
            canEditFramework: { type: 'boolean', required: true },
            isDefaultRole: { type: 'boolean' },
            isPrivateRole: { type: 'boolean' },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

{
    const name = 'frameworkRolesList';
    const schema = {
        doc: {
            name: 'Frameworks roles list',
            description: 'List of framework roles',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.frameworkRole', required: true },
        },
    };
    analysisFrameworkSchema.push({ name, schema });
}

export default analysisFrameworkSchema;
