const languagesSchema = [];

{
    const name = 'languageMini';
    const schema = {
        doc: {
            name: 'Language',
            description: '',
        },
        fields: {
            code: { type: 'string', required: true },
            title: { type: 'string', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}

{
    const name = 'languagesGetResponse';
    const schema = {
        doc: {
            name: 'Languages',
            description: 'List of language',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.languageMini', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}

export default languagesSchema;
