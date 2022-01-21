import React from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { useRequest } from '#base/utils/restRequest';
import { ProjectMemberships } from '#types/project';
import { MultiResponse } from '#types';

import UserList from './UserList';
import UserGroupList from './UserGroupList';

import styles from './styles.css';

interface Props {
    projectId: string;
    activeUserId?: string;
}

function Users(props: Props) {
    const {
        projectId,
        activeUserId,
    } = props;

    // FIXME: we should have a request to get project role of a certain user
    const {
        pending: pendingMemberships,
        response: projectMembershipsResponse,
    } = useRequest<MultiResponse<ProjectMemberships>>({
        skip: isNotDefined(activeUserId),
        url: `server://projects/${projectId}/project-memberships/`,
        query: {
            member: activeUserId,
        },
        method: 'GET',
    });

    const activeUserMembership = projectMembershipsResponse?.results[0];
    const activeUserRoleLevel = activeUserMembership?.roleDetails.level;

    return (
        <div className={styles.users}>
            <UserList
                className={styles.userList}
                projectId={projectId}
                activeUserId={activeUserId}
                activeUserRoleLevel={activeUserRoleLevel}
                pending={pendingMemberships}
            />
            <UserGroupList
                className={styles.userGroupList}
                projectId={projectId}
                activeUserRoleLevel={activeUserRoleLevel}
                pending={pendingMemberships}
            />
        </div>
    );
}

export default Users;
