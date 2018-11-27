import update from '#rsu/immutable-update';

// import all from '../domainData/projects';

// TYPE

export const UP__SET_USER_PROFILE = 'siloDomainData/USER_PROFILE/SET_USER_PROFILE';
export const UP__SET_USER_PROJECT = 'siloDomainData/USER_PROFILE/SET_USER_PROJECT';
export const UP__SET_USER_USERGROUP = 'siloDomainData/USER_PROFILE/SET_USER_USERGROUP';

export const UP__UNSET_USER_PROFILE = 'domainData/USER_PROFILE/UNSET_USER_PROFILE';
export const UP__UNSET_USER_USERGROUP = 'domainData/USER_PROFILE/UNSET_USER_USERGROUP';

// ACTION-CREATOR

export const setUserProfileAction = ({
    userId, information, projects, usergroups,
}) => ({
    type: UP__SET_USER_PROFILE,
    userId,
    information,
    projects,
    usergroups,
});

export const setUserProjectAction = ({
    userId, project,
}) => ({
    type: UP__SET_USER_PROJECT,
    userId,
    project,
});

export const setUserUsergroupAction = ({
    userId, usergroup,
}) => ({
    type: UP__SET_USER_USERGROUP,
    userId,
    usergroup,
});

export const unsetUserProfileAction = ({ userId }) => ({
    type: UP__UNSET_USER_PROFILE,
    userId,
});


export const unsetUserProfileUsergroupAction = ({ userId, usergroupId }) => ({
    type: UP__UNSET_USER_USERGROUP,
    userId,
    usergroupId,
});

// REDUCER

const setUserProfile = (state, action) => {
    const {
        information,
        projects,
        usergroups,
        userId,
    } = action;
    const settings = {
        userView: {
            [userId]: { $auto: {
                $mergeIfDefined: {
                    information,
                    usergroups,
                    projects,
                },
            } },
        },
    };
    return update(state, settings);
};

const setUserProject = (state, action) => {
    const { userId, project } = action;
    if (!userId) {
        return state;
    }
    const settings = {
        userView: {
            [userId]: { $auto: {
                projects: { $autoArray: {
                    // TODO: Use better immutable helper
                    $bulk: [
                        { $filter: p => p.id !== project.id },
                        { $push: [project] },
                    ],
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserUsergroup = (state, action) => {
    const { userId, usergroup } = action;
    const settings = {
        userView: {
            [userId]: { $auto: {
                usergroups: { $autoArray: {
                    // TODO: Use better immutable helper
                    $bulk: [
                        { $filter: ug => ug.id !== usergroup.id },
                        { $push: [usergroup] },
                    ],
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserProfile = (state, action) => {
    const { userId } = action;
    const settings = {
        userView: { $unset: [userId] },
    };
    return update(state, settings);
};

const unsetUserUsergroup = (state, { userId, usergroupId }) => {
    const settings = {
        userView: {
            [userId]: { $auto: {
                usergroups: { $autoArray: {
                    $filter: usergroup => usergroup.id !== usergroupId,
                } },
            } },
        },
    };
    return update(state, settings);
};

// REDUCER MAP

const reducers = {
    [UP__SET_USER_PROFILE]: setUserProfile,
    [UP__SET_USER_PROJECT]: setUserProject,
    [UP__SET_USER_USERGROUP]: setUserUsergroup,

    [UP__UNSET_USER_PROFILE]: unsetUserProfile,
    [UP__UNSET_USER_USERGROUP]: unsetUserUsergroup,
};

export default reducers;
