const entryGroupsSchema = [];

{
    const name = 'entryLabelOrder';
    const schema = {
        doc: {
            name: 'Entry Label Order',
            description: 'Response for entry label order',
        },
        fields: {
            id: { type: 'number', required: true },
            project: { type: 'number', required: true },
            title: { type: 'string', required: true },
            order: { type: 'number', required: true },
        },
    };
    entryGroupsSchema.push({ name, schema });
}
{
    const name = 'entryLabelMini';
    const schema = {
        doc: {
            name: 'Entry Label Mini',
            description: '',
        },
        fields: {
            id: { type: 'number', required: true },
            project: { type: 'number', required: true },
            createdByName: { type: 'string', required: true },
            entryCount: { type: 'number', required: false },
            title: { type: 'string', required: true },
            order: { type: 'number', required: true },
            color: { type: 'string', required: true },
        },
    };
    entryGroupsSchema.push({ name, schema });
}
{
    const name = 'entryLabel';
    const schema = {
        doc: {
            name: 'Entry Label',
            description: '',
        },
        extends: 'dbentity',
        fields: {
            createdByName: { type: 'string', required: true },
            title: { type: 'string', required: true },
            order: { type: 'number', required: true },
            color: { type: 'string', required: true },
            entryCount: { type: 'number', required: false },
            clientId: { type: 'string', required: false },
            project: { type: 'number', required: true },
        },
    };
    entryGroupsSchema.push({ name, schema });
}
{
    const name = 'entryLabelsList';
    const schema = {
        doc: {
            name: 'Entry Labels list',
            description: '',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.entryLabelMini', required: true },
        },
    };
    entryGroupsSchema.push({ name, schema });
}

export default entryGroupsSchema;
