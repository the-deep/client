import update from '#rs/utils/immutable-update';

// TYPE

export const N__SET_NOTIFICATIONS = 'siloDomainData/N__SET_NOTIFICATIONS';
export const N__SET_PROJECT_JOIN_STATUS = 'siloDomainData/N__SET_PROJECT_JOIN_STATUS';

// ACTION-CREATOR

export const setNotificationsAction = ({ notifications, totalNotifications }) => ({
    type: N__SET_NOTIFICATIONS,
    notifications,
    totalNotifications,
});

export const setProjectJoinStatusAction = ({ newNotificationDetails }) => ({
    type: N__SET_PROJECT_JOIN_STATUS,
    newNotificationDetails,
});

// REDUCER

const setNotifications = (state, action) => {
    const { notifications, totalNotifications } = action;
    const settings = {
        notificationsView: { $auto: {
            notifications: { $set: notifications },
            totalNotifications: { $set: totalNotifications },
        } },
    };
    return update(state, settings);
};

const setProjectJoinStatus = (state, action) => {
    const { notificationsView: { notifications = [] } } = state;
    const { newNotificationDetails } = action;

    // TODO: Write better check
    const index = notifications.findIndex(
        n => (n.details || {}).id === newNotificationDetails.id,
    );

    const settings = {
        notificationsView: { $auto: {
            notifications: { $autoArray: {
                [index]: {
                    details: { $set: newNotificationDetails },
                },
            } },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [N__SET_NOTIFICATIONS]: setNotifications,
    [N__SET_PROJECT_JOIN_STATUS]: setProjectJoinStatus,
};

export default reducers;
