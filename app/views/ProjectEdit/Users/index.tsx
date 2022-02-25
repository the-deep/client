import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';

import UserList from './UserList';
import UserGroupList from './UserGroupList';
import {
    MembershipQuery,
    MembershipQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const MEMBERSHIP = gql`
    query Membership($id: ID!) {
        project(id: $id) {
            id
            userMembers {
                results {
                  clientId
                  id
                  badges
                  member {
                    id
                    displayName
                  }
                  role {
                    id
                    level
                    title
                  }
                  joinedAt
                  addedBy {
                    id
                    displayName
                  }
                }
                totalCount
            }
        }
    }
`;

interface Props {
    projectId: string;
    activeUserId?: string;
}

function Users(props: Props) {
    const {
        projectId,
        activeUserId,
    } = props;

    const membershipVariables = useMemo(
        (): MembershipQueryVariables | undefined => ({
            id: projectId,
        }),
        [projectId],
    );

    const {
        data: projectMembershipsResponse,
        loading: pendingMemberships,
    } = useQuery<MembershipQuery, MembershipQueryVariables>(
        MEMBERSHIP,
        {
            variables: membershipVariables,
        },
    );

    const activeUserMembership = projectMembershipsResponse?.project?.userMembers?.results?.[0];
    const activeUserRoleLevel = activeUserMembership?.role?.level;

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
