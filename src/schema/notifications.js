const notificationsSchema = [];

{
    const name = 'notification';
    const schema = {
        doc: {
            name: 'Notification Get Response',
            description: 'Response for unit of users/me/notifications/',
        },
        fields: {
            details: { type: 'object', required: true },
            date: { type: 'string', required: true },
            type: { type: 'string', required: true },
        },
    };
    notificationsSchema.push({ name, schema });
}

{
    const name = 'notifications';
    const schema = {
        doc: {
            name: 'Notifications Get Response',
            description: 'Response for GET users/me/notifications/',
        },
        fields: {
            count: { type: 'uint', required: true },
            next: { type: 'string' },
            previous: { type: 'string' },
            results: { type: 'array.notification', required: true },
        },
    };
    notificationsSchema.push({ name, schema });
}

export default notificationsSchema;
