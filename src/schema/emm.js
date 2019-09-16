const emmSchema = [];

{
    const name = 'emmEntity';
    const schema = {
        doc: {
            name: 'EMM Entity',
            description: 'EMM entity',
        },
        fields: {
            name: { type: 'string' },
        },
    };
    emmSchema.push({ name, schema });
}

{
    const name = 'emmEntityForSummary';
    const schema = {
        doc: {
            name: 'EMM Entity for summary',
            description: 'EMM entity for summary',
        },
        fields: {
            name: { type: 'string' },
            totalCount: { type: 'number' },
        },
    };
    emmSchema.push({ name, schema });
}

{
    const name = 'emmTrigger';
    const schema = {
        doc: {
            name: 'EMM Trigger',
            description: 'EMM trigger',
        },
        fields: {
            emmKeyword: { type: 'string' },
            emmRiskFactor: { type: 'string' },
            count: { type: 'number' },
        },
    };
    emmSchema.push({ name, schema });
}

{
    const name = 'emmTriggerForSummary';
    const schema = {
        doc: {
            name: 'EMM Trigger for summary',
            description: 'EMM trigger for summary',
        },
        fields: {
            emmKeyword: { type: 'string' },
            emmRiskFactor: { type: 'string' },
            totalCount: { type: 'number' },
        },
    };
    emmSchema.push({ name, schema });
}

{
    const name = 'emmSummary';
    const schema = {
        doc: {
            name: 'EMM Summary',
            description: 'EMM Summary',
        },
        fields: {
            emmTriggers: { type: 'array.emmTriggerForSummary', required: true },
            emmEntities: { type: 'array.emmEntityForSummary', required: true },
        },
    };
    emmSchema.push({ name, schema });
}

export default emmSchema;
