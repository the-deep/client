import React, { useContext } from 'react';

import { ProjectRoleTypeEnum } from '#generated/types';
import ProjectContext from '#base/context/ProjectContext';

import UserList from './UserList';
import UserGroupList from './UserGroupList';

import styles from './styles.css';

// FIXME: This is a hack for now. Need to fetch this from server later when
// work on server is completed
export const roleLevels: { [key in ProjectRoleTypeEnum]: number } = {
    PROJECT_OWNER: 100,
    ADMIN: 90,
    MEMBER: 80,
    READER: 70,
    READER_NON_CONFIDENTIAL: 60,
    UNKNOWN: 0,
};

interface Props {
    projectId: string;
    activeUserId?: string;
}

function Users(props: Props) {
    const {
        projectId,
        activeUserId,
    } = props;

    const { project } = useContext(ProjectContext);

    const activeUserRoleLevel = project?.currentUserRole
        ? roleLevels[project.currentUserRole] : 0;

    return (
        <div className={styles.users}>
            <UserList
                className={styles.userList}
                projectId={projectId}
                activeUserId={activeUserId}
                activeUserRoleLevel={activeUserRoleLevel}
            />
            <UserGroupList
                className={styles.userGroupList}
                projectId={projectId}
                activeUserRoleLevel={activeUserRoleLevel}
            />
        </div>
    );
}

export default Users;
