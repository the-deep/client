import update from '#rsu/immutable-update';
import { isFalsy } from '#rsu/common';

// TYPE

export const UG__SET_USERGROUP_VIEW = 'siloDomainData/USERGROUP_VIEW/SET_USERGROUP_VIEW';
export const UG__SET_USERGROUP_MEMBERSHIP = 'siloDomainData/USERGROUP_VIEW/SET_USERGROUP_MEMBERSHIP';
export const UG__ADD_USERGROUP_MEMBERSHIPS = 'siloDomainData/USERGROUP_VIEW/ADD_USERGROUP_MEMBERSHIPS';
export const UG__SET_USERGROUP_PROJECT = 'siloDomainData/USERGROUP_VIEW/SET_USERGROUP_PROJECT';

export const UG__UNSET_USERGROUP_MEMBERSHIP = 'siloDomainData/USERGROUP_VIEW/UNSET_USERGROUP_MEMBERSHIP';
export const UG__UNSET_USERGROUP_PROJECT = 'siloDomainData/USERGROUP_VIEW/UNSET_USERGROUP_PROJECT';

// ACTION-CREATOR

export const setUsergroupViewAction = ({
    usergroupId, information, projects, memberships,
}) => ({
    usergroupId,
    information,
    projects,
    memberships,
    type: UG__SET_USERGROUP_VIEW,
});

export const setUsergroupViewMembershipAction = ({ usergroupId, membership }) => ({
    usergroupId,
    membership,
    type: UG__SET_USERGROUP_MEMBERSHIP,
});

export const addUsergroupViewMembershipsAction = ({ usergroupId, memberships }) => ({
    usergroupId,
    memberships,
    type: UG__ADD_USERGROUP_MEMBERSHIPS,
});

export const setUsergroupViewProjectAction = ({ project }) => ({
    project,
    type: UG__SET_USERGROUP_PROJECT,
});

export const unsetUsergroupViewMembershipAction = ({ usergroupId, membershipId }) => ({
    usergroupId,
    membershipId,
    type: UG__UNSET_USERGROUP_MEMBERSHIP,
});

export const unsetUsergroupViewProjectAction = ({ usergroupId, projectId }) => ({
    usergroupId,
    projectId,
    type: UG__UNSET_USERGROUP_PROJECT,
});


// REDUCER

const setUsergroupView = (state, action) => {
    const {
        usergroupId,
        information,
        projects,
        memberships,
    } = action;
    const settings = {
        usergroupView: {
            [usergroupId]: { $auto: {
                $mergeIfDefined: {
                    information,
                    projects,
                    memberships,
                },
            } },
        },
    };
    return update(state, settings);
};

const setUsergroupMembership = (state, action) => {
    const {
        usergroupId,
        membership,
    } = action;
    const settings = {
        usergroupView: {
            [usergroupId]: { $auto: {
                memberships: { $autoArray: {
                    // TODO: Use better immutable helper
                    $bulk: [
                        { $filter: m => m.id !== membership.id },
                        { $push: [membership] },
                    ],
                } },
            } },
        },
    };
    return update(state, settings);
};

const addUsergroupMemberships = (state, action) => {
    const {
        usergroupId,
        memberships,
    } = action;
    const settings = {
        usergroupView: {
            [usergroupId]: { $auto: {
                memberships: { $autoArray: {
                    // TODO: Use better immutable helper
                    $bulk: [
                        {
                            $filter: membership => !memberships.find(
                                m => m.id === membership.id,
                            ),
                        },
                        { $push: memberships },
                    ],
                } },
            } },
        },
    };
    return update(state, settings);
};

const setUserProject = (state, action) => {
    const { project } = action;
    if (isFalsy(project.userGroups)) {
        return state;
    }
    const usergroupView = project.userGroups.reduce(
        (acc, usergroup) => (
            {
                ...acc,
                [usergroup.id]: { $auto: {
                    projects: { $autoArray: {
                        // TODO: Use better immutable helper
                        $bulk: [
                            { $filter: p => p.id !== project.id },
                            { $push: [project] },
                        ],
                    } },
                } },
            }
        ),
        {},
    );
    const settings = { usergroupView };
    return update(state, settings);
};

const unsetUsergroupMembership = (state, { usergroupId, membershipId }) => {
    const settings = {
        usergroupView: {
            [usergroupId]: { $auto: {
                memberships: { $autoArray: {
                    $filter: membership => membership.id !== membershipId,
                } },
            } },
        },
    };
    return update(state, settings);
};

const unsetUserProject = (state, { usergroupId, projectId }) => {
    const settings = {
        usergroupView: {
            [usergroupId]: { $auto: {
                projects: { $autoArray: {
                    $filter: project => project.id !== projectId,
                } },
            } },
        },
    };
    return update(state, settings);
};


// REDUCER MAP

const reducers = {
    [UG__SET_USERGROUP_VIEW]: setUsergroupView,
    [UG__SET_USERGROUP_MEMBERSHIP]: setUsergroupMembership,
    [UG__ADD_USERGROUP_MEMBERSHIPS]: addUsergroupMemberships,
    [UG__SET_USERGROUP_PROJECT]: setUserProject,

    [UG__UNSET_USERGROUP_MEMBERSHIP]: unsetUsergroupMembership,
    [UG__UNSET_USERGROUP_PROJECT]: unsetUserProject,
};

export default reducers;
