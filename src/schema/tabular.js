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
            metaStatus: { type: 'string', required: true },
            options: { type: 'object', required: true },
            project: { type: 'uint', required: true },
            status: { type: 'string', require: true },
            title: { type: 'string', require: true },
            sheets: { type: 'array.sheetSchema', require: true },
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
            options: { type: 'object', required: true },
            title: { type: 'string', required: true },
            id: { type: 'uint', required: true },
        },
    };
    tabularSchema.push({ name, schema });
}

export default tabularSchema;
