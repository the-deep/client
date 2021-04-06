import React from 'react';

import useRequest from '#utils/request';

import {
    Membership,
    ProjectRole,
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
        rolesResponse,
    ] = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
        autoTrigger: true,
    });

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
                projectRoleList={rolesResponse?.results ?? []}
                projectId={projectId}
            />
            <UserGroupList
                className={styles.userGroupList}
                users={usersResponse?.results ?? []}
                projectId={projectId}
                projectRoleList={rolesResponse?.results ?? []}
            />
        </div>
    );
}

export default Users;
