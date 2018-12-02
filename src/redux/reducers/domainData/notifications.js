import update from '#rsu/immutable-update';

// TYPE

export const SET_NOTIFICATION = 'domainData/SET_NOTIFICATION';
export const SET_NOTIFICATIONS = 'domainData/SET_NOTIFICATIONS';
export const SET_NOTIFICATIONS_COUNT = 'domainData/SET_NOTIFICATIONS_COUNT';

// ACTION-CREATOR

export const setNotificationAction = ({ notification }) => ({
    type: SET_NOTIFICATION,
    notification,
});

export const setNotificationsAction = ({ notifications }) => ({
    type: SET_NOTIFICATIONS,
    notifications,
});

export const setNotificationsCountAction = ({ count }) => ({
    type: SET_NOTIFICATIONS_COUNT,
    count,
});

// REDUCER

const setNotification = (state, action) => {
    const { notification } = action;
    const settings = {
        notifications: { $auto: {
            items: {
                $replaceOrPush: [
                    item => item.id === notification.id,
                    () => notification,
                ],
            },
        } },
    };
    return update(state, settings);
};

const setNotifications = (state, action) => {
    const { notifications } = action;
    const settings = {
        notifications: { $auto: {
            items: {
                $set: notifications,
            },
        } },
    };
    return update(state, settings);
};

const setNotificationsCount = (state, action) => {
    const { count } = action;
    const settings = {
        notifications: { $auto: {
            count: {
                $set: count,
            },
        } },
    };
    return update(state, settings);
};

const reducers = {
    [SET_NOTIFICATION]: setNotification,
    [SET_NOTIFICATIONS]: setNotifications,
    [SET_NOTIFICATIONS_COUNT]: setNotificationsCount,
};
export default reducers;
