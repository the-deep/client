import React, { useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';

import { useRequest } from '#base/utils/restRequest';
import { ProjectMemberships } from '#types/project';
import { MultiResponse } from '#types';

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

    // FIXME: we should have a request to get project role of a certain user
    // const {
    //    pending: pendingMemberships,
    //    response: projectMembershipsResponse,
    // } = useRequest<MultiResponse<ProjectMemberships>>({
    //    skip: isNotDefined(activeUserId),
    //    url: `server://projects/${projectId}/project-memberships/`,
    //    query: {
    //        member: activeUserId,
    //    },
    //    method: 'GET',
    // });

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
    console.log('Membersss GQL Data::###>>', projectMembershipsResponse);

    // eslint-disable-next-line max-len
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
