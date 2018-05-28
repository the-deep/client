const languagesSchema = [];

{
    const name = 'languageMini';
    const schema = {
        doc: {
            name: 'Language Mini',
        },
        fields: {
            code: { type: 'string', required: true },
            title: { type: 'string', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}
{
    const name = 'languageString';
    const schema = {
        doc: {
            name: 'Language String',
            description: 'String object for languagee from server',
        },
        fields: {
            id: { type: 'number', required: true },
            value: { type: 'string', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}
{
    const name = 'languageLink';
    const schema = {
        doc: {
            name: 'Language Link',
            description: 'String object for language from link',
        },
        fields: {
            key: { type: 'string', required: true },
            string: { type: 'number', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}
{
    const name = 'languageLinkCollection';
    const schema = {
        doc: {
            name: 'Language Link Collection',
            description: 'Map of language link',
        },
        fields: {
            '*': { type: 'array.languageLink', required: true },
        },
    };
    languagesSchema.push({ name, schema });
}
{
    const name = 'language';
    const schema = {
        doc: {
            name: 'Language',
        },
        fields: {
            code: { type: 'string', required: true },
            title: { type: 'string', required: true },
            strings: { type: 'array.languageString', required: true }, // FIXME: better schema
            links: { type: 'languageLinkCollection', required: true }, // FIXME: better schema
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
