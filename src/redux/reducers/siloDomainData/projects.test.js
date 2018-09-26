import reducers, {
    SET_PROJECT_MEMBERSHIPS,
    ADD_PROJECT_MEMBERSHIP,
    SET_PROJECT_USERGROUPS,
    ADD_PROJECT_USERGROUP,
    REMOVE_PROJECT_MEMBERSHIP,
    REMOVE_PROJECT_USERGROUP,

    setProjectMembershipsAction,
    addProjectMembershipAction,
    setProjectUserGroupsAction,
    addProjectUserGroupAction,
    removeProjectMembershipAction,
    removeProjectUserGroupAction,
} from './projects';


test('should set project memberships', () => {
    const state = {
        projectsView: {
            1: {
            },
        },
    };
    const projectId = 1;
    const memberships = [
        {
            memberEmail: 'test@test.com',
            memberName: 'Bibek Pandey',
            member: 2,
            id: 9,
            role: 'admin',
            joinedAt: '2018-09-11T09:01:09.942690Z',
            project: 1,
        },
    ];

    const action = setProjectMembershipsAction({
        memberships,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                memberships,
            },
        },
    };

    expect(reducers[SET_PROJECT_MEMBERSHIPS](state, action)).toEqual(after);
});

test('should add project membership', () => {
    const memberships = [
        {
            memberEmail: 'test@test.com',
            memberName: 'Nameless',
            member: 2,
            id: 9,
            role: 'admin',
            joinedAt: '2018-09-11T09:01:09.942690Z',
            project: 1,
        },
    ];
    const state = {
        projectsView: {
            1: {
                memberships,
            },
        },
    };
    const projectId = 1;
    const membership = [
        {
            memberEmail: 'test@test.com',
            memberName: 'Test User',
            member: 3,
            id: 9,
            role: 'analyst',
            joinedAt: '2018-09-13T09:01:09.942690Z',
            project: 1,
        },
    ];

    const action = addProjectMembershipAction({
        membership,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                memberships: [...memberships, membership],
            },
        },
    };

    expect(reducers[ADD_PROJECT_MEMBERSHIP](state, action)).toEqual(after);
});

test('should set project usergroups', () => {
    const state = {
        projectsView: {
            1: {
            },
        },
    };

    const projectId = 1;
    const userGroups = [
        {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
    ];

    const action = setProjectUserGroupsAction({
        userGroups,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                userGroups,
            },
        },
    };
    expect(reducers[SET_PROJECT_USERGROUPS](state, action)).toEqual(after);
});

test('should add project usergroup', () => {
    const userGroups = [
        {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
    ];
    const state = {
        projectsView: {
            1: {
                userGroups,
            },
        },
    };

    const projectId = 1;
    const userGroup = {
        id: 6,
        title: 'Next Usergroup',
        joinedAt: '2018-09-13T12:42:14.398602Z',
        project: 1,
        usergroup: 1,
        addedBy: null,
    };

    const action = addProjectUserGroupAction({
        userGroup,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                userGroups: [...userGroups, userGroup],
            },
        },
    };
    expect(reducers[ADD_PROJECT_USERGROUP](state, action)).toEqual(after);
});

test('should remove project membership', () => {
    const memberships = [
        {
            memberEmail: 'test@test.com',
            memberName: 'Nameless',
            member: 2,
            id: 9,
            role: 'admin',
            joinedAt: '2018-09-11T09:01:09.942690Z',
            project: 1,
        },
        {
            memberEmail: 'test@test.com',
            memberName: 'Test User',
            member: 3,
            id: 8,
            role: 'analyst',
            joinedAt: '2018-09-13T09:01:09.942690Z',
            project: 1,
        },
    ];
    const state = {
        projectsView: {
            1: {
                memberships,
            },
        },
    };
    const projectId = 1;

    // first test removing first member

    const action = removeProjectMembershipAction({
        membership: memberships[0],
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                memberships: [memberships[1]],
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_MEMBERSHIP](state, action)).toEqual(after);

    // test removing next member
    const action1 = removeProjectMembershipAction({
        membership: memberships[1],
        projectId,
    });

    const after1 = {
        projectsView: {
            1: {
                memberships: [memberships[0]],
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_MEMBERSHIP](state, action1)).toEqual(after1);
});

test('should remove project usergroup', () => {
    const userGroups = [
        {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
        {
            id: 6,
            title: 'Next Usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 2,
            addedBy: null,
        },
    ];
    const projectId = 1;

    const state = {
        projectsView: {
            1: {
                userGroups,
            },
        },
    };

    // remove first usergroup
    const action = removeProjectUserGroupAction({
        userGroup: userGroups[0],
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                userGroups: [userGroups[1]],
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_USERGROUP](state, action)).toEqual(after);

    // remove second usergroup
    const action1 = removeProjectUserGroupAction({
        userGroup: userGroups[1],
        projectId,
    });

    const after1 = {
        projectsView: {
            1: {
                userGroups: [userGroups[0]],
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_USERGROUP](state, action1)).toEqual(after1);
});
