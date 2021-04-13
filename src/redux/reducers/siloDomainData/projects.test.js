import reducers, {
    SET_PROJECT_MEMBERSHIPS,
    ADD_PROJECT_MEMBERSHIP,
    SET_PROJECT_USERGROUPS,
    ADD_PROJECT_USERGROUP,
    REMOVE_PROJECT_MEMBERSHIP,
    REMOVE_PROJECT_USERGROUP,

    setProjectMembershipsAction,
    addProjectMembershipAction,
    setProjectUsergroupsAction,
    addProjectUsergroupAction,
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
                memberships: memberships.reduce((acc, m) => ({
                    ...acc,
                    [m.id]: m,
                }), {}),
            },
        },
    };

    expect(reducers[SET_PROJECT_MEMBERSHIPS](state, action)).toEqual(after);
});

test('should add project membership', () => {
    const memberships = {
        9: {
            memberEmail: 'test@test.com',
            memberName: 'Nameless',
            member: 2,
            id: 9,
            role: 'admin',
            joinedAt: '2018-09-11T09:01:09.942690Z',
            project: 1,
        },
    };
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
                memberships: {
                    ...memberships,
                    [membership.id]: membership,
                },
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
    const usergroups = [
        {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
    ];

    const action = setProjectUsergroupsAction({
        usergroups,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                usergroups: usergroups.reduce((acc, ug) => ({
                    ...acc,
                    [ug.id]: ug,
                }), {}),
            },
        },
    };
    expect(reducers[SET_PROJECT_USERGROUPS](state, action)).toEqual(after);
});

test('should add project usergroup', () => {
    const usergroups = {
        7: {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
    };
    const state = {
        projectsView: {
            1: {
                usergroups,
            },
        },
    };

    const projectId = 1;
    const usergroup = {
        id: 6,
        title: 'Next Usergroup',
        joinedAt: '2018-09-13T12:42:14.398602Z',
        project: 1,
        usergroup: 1,
        addedBy: null,
    };

    const action = addProjectUsergroupAction({
        usergroup,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                usergroups: {
                    ...usergroups,
                    [usergroup.id]: usergroup,
                },
            },
        },
    };
    expect(reducers[ADD_PROJECT_USERGROUP](state, action)).toEqual(after);
});

test('should remove project membership', () => {
    const memberships = {
        9: {
            memberEmail: 'test@test.com',
            memberName: 'Nameless',
            member: 2,
            id: 9,
            role: 'admin',
            joinedAt: '2018-09-11T09:01:09.942690Z',
            project: 1,
        },
        8: {
            memberEmail: 'test@test.com',
            memberName: 'Test User',
            member: 3,
            id: 8,
            role: 'analyst',
            joinedAt: '2018-09-13T09:01:09.942690Z',
            project: 1,
        },
    };
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
        membershipId: 8,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                memberships: {
                    9: memberships[9],
                },
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_MEMBERSHIP](state, action)).toEqual(after);

    // test removing next member
    const action1 = removeProjectMembershipAction({
        membershipId: 9,
        projectId,
    });

    const after1 = {
        projectsView: {
            1: {
                memberships: {
                    8: memberships[8],
                },
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_MEMBERSHIP](state, action1)).toEqual(after1);
});

test('should remove project usergroup', () => {
    const usergroups = {
        7: {
            id: 7,
            title: 'My usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 1,
            addedBy: null,
        },
        6: {
            id: 6,
            title: 'Next Usergroup',
            joinedAt: '2018-09-13T12:42:14.398602Z',
            project: 1,
            usergroup: 2,
            addedBy: null,
        },
    };
    const projectId = 1;

    const state = {
        projectsView: {
            1: {
                usergroups,
            },
        },
    };

    // remove first usergroup
    const action = removeProjectUserGroupAction({
        usergroupId: 7,
        projectId,
    });

    const after = {
        projectsView: {
            1: {
                usergroups: {
                    6: usergroups[6],
                },
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_USERGROUP](state, action)).toEqual(after);

    // remove second usergroup
    const action1 = removeProjectUserGroupAction({
        usergroupId: 6,
        projectId,
    });

    const after1 = {
        projectsView: {
            1: {
                usergroups: {
                    7: usergroups[7],
                },
            },
        },
    };
    expect(reducers[REMOVE_PROJECT_USERGROUP](state, action1)).toEqual(after1);
});
