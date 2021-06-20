import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import {
    Table,
    createStringColumn,
} from '@the-deep/deep-ui';

import {
    activeUserSelector,
} from '#redux';
import { useRequest } from '#utils/request';
import {
    AppState,
    MultiResponse,
} from '#typings';

import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

interface Membership {
    id: number;
    member: number;
    memberName: string;
    memberEmail: string;
    role: string;
    group: number;
    joinedAt: string;
}

interface Usergroup {
    id: number;
    title: string;
    description: string;
    role: string;
    memberships: Membership[];
    globalCrisisMonitoring: boolean;
}

interface Props {
    activeUser: { userId: number };
}

const usergroupKeySelector = (d:Usergroup) => d.id;
function UserGroup(props: Props) {
    const {
        activeUser,
    } = props;

    const usergroupQuery = useMemo(() => ({
        user: activeUser.userId,
    }), [activeUser.userId]);

    const {
        pending: usergroupGetPending,
        response: usergroupResponse,
    } = useRequest<MultiResponse<Usergroup>>({
        url: 'server://user-groups/member-of/',
        method: 'GET',
        query: usergroupQuery,
        onSuccess: (response) => {
            console.warn('Success', response);
        },
    });

    console.warn(usergroupGetPending, usergroupResponse);

    const columns = useMemo(() => ([
        createStringColumn<Usergroup, number>(
            'group',
            'Group',
            item => item.title,
        ),
        createStringColumn<Usergroup, number>(
            'members',
            'Member',
            item => item.memberships.length.toString(),
        ),
    ]), []);

    return (
        <div className={styles.userGroup}>
            <Table
                columns={columns}
                keySelector={usergroupKeySelector}
                data={usergroupResponse?.results}
            />
        </div>
    );
}

export default connect(mapStateToProps)(UserGroup);
