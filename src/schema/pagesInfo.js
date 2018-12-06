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
{
    const name = 'pageInfoRequest';
    const schema = {
        doc: {
            name: 'Page Info Request',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.pageInfo', required: true },
        },
    };
    pageInfoSchema.push({ name, schema });
}

export default pageInfoSchema;
