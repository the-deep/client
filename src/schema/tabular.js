const tabularSchema = [];

{
    const name = 'TabularBookSchema';
    const schema = {
        doc: {
            name: 'Tabular Book',
            description: 'Tabular book schema',
        },
        extends: 'dbentity',
        fields: {

            file: { type: 'uint', required: true },
            fileType: { type: 'string', required: true },
            metaStatus: { type: 'string' },
            options: { type: 'object' },
            project: { type: 'uint' },
            status: { type: 'string', required: true },
            title: { type: 'string', required: true },
            sheets: { type: 'array.sheetSchema', required: true },
        },
    };
    tabularSchema.push({ name, schema });
}
{
    const name = 'sheetSchema';
    const schema = {
        doc: {
            name: 'Tabular Sheet',
            description: 'Tabular sheet schema',
        },
        fields: {
            data: { type: 'array.object', required: true },
            fields: { type: 'array.object', required: true },
            options: { type: 'object' },
            title: { type: 'string', required: true },
            id: { type: 'uint', required: true },
        },
    };
    tabularSchema.push({ name, schema });
}

export default tabularSchema;
