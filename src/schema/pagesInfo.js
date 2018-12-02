const pageInfoSchema = [];

{
    const name = 'pageInfo';
    const schema = {
        doc: {
            name: 'Page Info',
            description: 'One of the main entities',
        },
        extends: 'dbentity',
        fields: {
            id: { type: 'uint', required: true },
            title: { type: 'string', required: true },
            pageId: { type: 'string', required: true },
            helpUrl: { type: 'string' },
        },
    };
    pageInfoSchema.push({ name, schema });
}

export default pageInfoSchema;
