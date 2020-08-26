const notificationsSchema = [];

{
    const name = 'notification';
    const schema = {
        doc: {
            name: 'Notification Get Response',
            description: 'Response for unit of users/me/notifications/',
        },
        fields: {
            id: { type: 'uint', required: true },
            notificationType: { type: 'string', required: true },
            project: { type: 'uint', required: true },
            receiver: { type: 'uint' },
            status: { type: 'string' },
            timestamp: { type: 'string' },
        },
    };
    notificationsSchema.push({ name, schema });
}

{
    const name = 'notificationsCountResponse';
    const schema = {
        doc: {
            name: 'Notification Count Get Request',
            description: 'Response for /notifications/count/',
        },
        fields: {
            unseenRequests: { type: 'uint', required: true },
            unseenNotifications: { type: 'uint', required: true },
            total: { type: 'uint', required: true },
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
