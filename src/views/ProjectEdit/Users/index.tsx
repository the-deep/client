import React from 'react';

import useRequest from '#utils/request';

import {
    Membership,
    MultiResponse,
} from '#typings';

import UserList from './UserList';
import UserGroupList from './UserGroupList';

import styles from './styles.scss';

interface Props {
    projectId: string;
}

function Users(props: Props) {
    const { projectId } = props;

    const [
        ,
        usersResponse,
    ] = useRequest<MultiResponse<Membership>>({
        url: 'server://project-memberships/',
        method: 'GET',
        query: {
            project: projectId,
        },
        autoTrigger: true,
    });

    return (
        <div className={styles.users}>
            <UserList
                className={styles.userList}
                projectId={projectId}
            />
            <UserGroupList
                className={styles.userGroupList}
                users={usersResponse?.results ?? []}
                projectId={projectId}
            />
        </div>
    );
}

export default Users;
