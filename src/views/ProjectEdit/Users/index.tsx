import React from 'react';

import UserList from './UserList';
import UserGroupList from './UserGroupList';

import styles from './styles.scss';

interface Props {
    projectId: string;
}

function Users(props: Props) {
    const { projectId } = props;

    return (
        <div className={styles.users}>
            <UserList
                className={styles.userList}
                projectId={projectId}
            />
            <UserGroupList
                className={styles.userGroupList}
                projectId={projectId}
            />
        </div>
    );
}

export default Users;
