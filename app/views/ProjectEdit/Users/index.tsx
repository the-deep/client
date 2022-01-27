import React, { useMemo } from 'react';
import { isNotDefined } from '@togglecorp/fujs';
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
    query Membership($projectId: Float) {
        userGroups(id: $projectId) {
            results {
                title
                id
                clientId
                memberships {
                    id
                    role
                    joinedAt
                    roleDisplay
                    member {
                      displayName
                      firstName
                      lastName
                      id
                    }
                }
            }
            totalCount
            page
            pageSize
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
    console.log('Memberships REST data::>>', projectMembershipsResponse);

    const membershipVariables = useMemo(
        (): MembershipQueryVariables | undefined => ({
            projectId,
        }),
        [projectId],
    );

    const {
        data: membershipResponse,
        loading: membershipPending,
        // refetch: triggerUsergroupResponse,
    } = useQuery<MembershipQuery, MembershipQueryVariables>(
        MEMBERSHIP,
        {
            skip: !projectId,
            variables: membershipVariables,
            onCompleted: (data) => {
                console.log('Membersss onComplete Data::###>>', data);
            },
        },
    );
    console.log('Membersss GQL Data::###>>', membershipResponse);

    const activeUserMembership = projectMembershipsResponse?.results?.[0];
    const activeUserRoleLevel = activeUserMembership?.roleDetails?.level;

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
