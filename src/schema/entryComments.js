const entryCommentsSchema = [];

{
    const name = 'textHistory';
    const schema = {
        doc: {
            name: 'textHistory',
            description: 'text history of entry comment',
        },
        fields: {
            id: { type: 'uint', required: true },
            createdAt: { type: 'string', required: true },
            text: { type: 'string', required: true },
        },
    };
    entryCommentsSchema.push({ name, schema });
}

{
    const name = 'entryComment';
    const schema = {
        doc: {
            name: 'entry comment',
            description: 'Response item for /entry-comments/',
        },
        fields: {
            id: { type: 'uint', required: true },
            isResolved: { type: 'boolean', required: true },
            parent: { type: 'uint', required: false },
            resolvedAt: { type: 'string', required: false },
            text: { type: 'string', required: true },
            textHistory: { type: 'array.textHistory', required: true },
            entry: { type: 'uint', required: true },
            assignee: { type: 'uint' },
            createdBy: { type: 'uint', required: true },
            assigneeDetail: {
                type: {
                    doc: {
                        name: 'assigneeDetail',
                        description: 'detail for assignee',
                    },
                    fields: {
                        displayPicture: { type: 'string' },
                        email: { type: 'string', required: true },
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        organization: { type: 'string' },
                    },
                },
            },
            createdByDetail: {
                type: {
                    doc: {
                        name: 'assigneeDetail',
                        description: 'detail for assignee',
                    },
                    fields: {
                        displayPicture: { type: 'string' },
                        email: { type: 'string', required: true },
                        id: { type: 'uint', required: true },
                        name: { type: 'string', required: true },
                        organization: { type: 'string' },
                    },
                },
                required: true,
            },
        },
    };
    entryCommentsSchema.push({ name, schema });
}

{
    const name = 'entryComments';
    const schema = {
        doc: {
            name: 'entry comments',
            description: 'Response for /entry-comments/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.entryComment', required: true },
        },
    };
    entryCommentsSchema.push({ name, schema });
}

export default entryCommentsSchema;
