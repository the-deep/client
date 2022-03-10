import React, { useMemo, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    Container,
    Pager,
} from '@the-deep/deep-ui';

import UserList from './UserList';
import UserGroupList from './UserGroupList';

import {
    MembershipQuery,
    MembershipQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const PROJECT_MEMBERSHIP = gql`
    query Membership(
        $id: ID!,
        $search: String,
        $page: Int,
        $pageSize: Int,
        ) {
        project(id: $id) {
            id
            userMembers (
              search: $search,
              page: $page,
              pageSize: $pageSize,
            ) {
                results {
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

const maxItemsPerPage = 20;

interface Props {
    projectId: string;
    activeUserId?: string;
}

function Users(props: Props) {
    const {
        projectId,
        activeUserId,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);

    const membershipVariables = useMemo(
        (): MembershipQueryVariables | undefined => ({
            id: projectId,
            page: activePage,
            pageSize: maxItemsPerPage,
        }),
        [
            projectId,
            activePage,
        ],
    );

    const {
        data: projectMembershipsResponse,
        loading: pendingMemberships,
    } = useQuery<MembershipQuery, MembershipQueryVariables>(
        PROJECT_MEMBERSHIP,
        {
            variables: membershipVariables,
        },
    );

    const activeUserMembership = projectMembershipsResponse?.project?.userMembers?.results?.[0];
    const activeUserRoleLevel = activeUserMembership?.role?.level;

    return (
        <Container
            className={styles.users}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={projectMembershipsResponse?.project?.userMembers?.totalCount ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={maxItemsPerPage}
                    itemsPerPageControlHidden
                />
            )}
        >
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
        </Container>
    );
}

export default Users;
