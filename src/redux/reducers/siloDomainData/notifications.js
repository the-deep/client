import update from '#rs/utils/immutable-update';

// TYPE

export const N__SET_NOTIFICATIONS = 'siloDomainData/N__SET_NOTIFICATIONS';

// ACTION-CREATOR

export const setNotificationsAction = ({ notifications, totalNotifications }) => ({
    type: N__SET_NOTIFICATIONS,
    notifications,
    totalNotifications,
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

const reducers = {
    [N__SET_NOTIFICATIONS]: setNotifications,
};

export default reducers;
