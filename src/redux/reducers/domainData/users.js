import update from '#rsu/immutable-update';
import { UP__SET_USER_PROFILE } from '../siloDomainData/users';

// TYPE

export const SET_USER_INFORMATION = 'domainData/SET_USER_INFORMATION';
export const SET_USERS_INFORMATION = 'domainData/SET_USERS_INFORMATION';

// ACTION-CREATOR

export const setUserInformationAction = ({ userId, information }) => ({
    type: SET_USER_INFORMATION,
    userId,
    information,
});

export const setUsersInformationAction = ({ users }) => ({
    type: SET_USERS_INFORMATION,
    users,
});

// REDUCER

const setUserInformation = (state, action) => {
    const { userId, information } = action;
    if (!(userId && information)) {
        return state;
    }
    const settings = {
        users: {
            [userId]: { $auto: {
                $mergeIfDefined: {
                    information,
                },
            } },
        },
    };
    return update(state, settings);
};

const setUsersInformation = (state, action) => {
    const { users } = action;

    const userSettings = users.reduce(
        (acc, user) => {
            acc[user.id] = { $auto: {
                information: { $auto: {
                    $merge: user,
                } },
            } };
            return acc;
        },
        {},
    );
    const settings = {
        users: userSettings,
    };
    return update(state, settings);
};


const reducers = {
    [SET_USER_INFORMATION]: setUserInformation,
    [SET_USERS_INFORMATION]: setUsersInformation,

    [UP__SET_USER_PROFILE]: setUserInformation,
};
export default reducers;
