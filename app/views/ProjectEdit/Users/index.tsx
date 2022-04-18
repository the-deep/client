import React, { useContext } from 'react';

import ProjectContext from '#base/context/ProjectContext';
import { roleLevels } from '#types/project';

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
                activeUserRole={project?.currentUserRole ?? undefined}
            />
            <UserGroupList
                className={styles.userGroupList}
                projectId={projectId}
                activeUserRole={project?.currentUserRole ?? undefined}
            />
        </div>
    );
}

export default Users;
