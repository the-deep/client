import React, { useContext, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useQuery, gql, useMutation } from '@apollo/client';
import {
    Button,
    Container,
    Pager,
    ListView,
    Kraken,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import { useModalState } from '#hooks/stateManagement';
import UserContext from '#base/context/UserContext';
import _ts from '#ts';

import AddUserGroupModal from './AddUsergroupModal';
import UserGroupItem, { Props as UserGroupItemProps } from './UserGroupItem';

import {
    UserGroupsQuery,
    UserGroupsQueryVariables,
    UserGroupDeleteMutation,
    UserGroupDeleteMutationVariables,
} from '#generated/types';
import styles from './styles.css';

export const USERGROUPS = gql`
    query UserGroups(
        $page: Int,
        $pageSize: Int,
    ) {
        userGroups(
            isCurrentUserMember: true,
            page: $page,
            pageSize: $pageSize,
        ) {
            results {
                id
                title
                createdAt
                description
                currentUserRole
                membershipsCount
            }
            totalCount
            pageSize
            page
        }
    }
    `;

const USER_GROUP_DELETE = gql`
    mutation UserGroupDelete(
        $id:ID!,
    ) {
        userGroup(
            id: $id,
        ) {
            id
            userGroupDelete {
                errors
                ok
                result {
                    id
                    currentUserRole
                    title
                }
            }
        }
    }
    `;

export type UsersGroupType = NonNullable<NonNullable<NonNullable<UserGroupsQuery>['userGroups']>['results']>[number];

const MAX_ITEMS_PER_PAGE = 10;
const usergroupKeySelector = (d: UsersGroupType) => d.id;

interface Props {
    className?: string;
}

function UserGroup(props: Props) {
    const {
        className,
    } = props;

    const {
        user,
    } = useContext(UserContext);
    const alert = useAlert();

    const userId = user ? user?.id : undefined;

    const [activePage, setActivePage] = useState<number>(1);
    const [expandedUserGroupId, setExpandedUserGroupId] = useState<string>();

    const [userGroupToEdit, setUserGroupToEdit] = useState<string>();

    const [
        showAddUserGroupModal,
        setUserGroupModalShow,
        setUserGroupModalHidden,
    ] = useModalState(false);

    const userGroupVariables = useMemo(
        (): UserGroupsQueryVariables | undefined => ({
            page: activePage,
            pageSize: MAX_ITEMS_PER_PAGE,
        }),
        [activePage],
    );

    const {
        data: userGroupsResponse,
        loading: usergroupGetPending,
        refetch: usergroupGetRetrigger,
    } = useQuery<UserGroupsQuery, UserGroupsQueryVariables>(
        USERGROUPS,
        {
            variables: userGroupVariables,
        },
    );

    const [
        usergroupDeleteTrigger,
        {
            loading: usergroupDeletePending,
        },
    ] = useMutation<UserGroupDeleteMutation, UserGroupDeleteMutationVariables>(
        USER_GROUP_DELETE,
        {
            onCompleted: (response) => {
                if (response?.userGroup?.userGroupDelete?.ok) {
                    usergroupGetRetrigger();
                    alert.show(
                        'Successfully deleted user group.',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete user group.',
                    { variant: 'error' },
                );
            },
        },
    );

    const usergroupObjectToEdit = useMemo(() => (
        userGroupsResponse?.userGroups
            ?.results?.find((userGroup) => userGroup.id === userGroupToEdit)
    ), [
        userGroupsResponse?.userGroups?.results,
        userGroupToEdit,
    ]);

    const handleAddUserGroupClick = useCallback(() => {
        setUserGroupToEdit(undefined);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const handleEditUserGroupClick = useCallback((value) => {
        setUserGroupToEdit(value);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const [autoFocusUserGroup, setAutoFocusUserGroup] = useState<string>();

    const handleEditUserGroupSuccess = useCallback((newItemId: string) => {
        setAutoFocusUserGroup(newItemId);
        usergroupGetRetrigger();
        setUserGroupModalHidden();
    }, [setUserGroupModalHidden, usergroupGetRetrigger]);

    const handleExpansionChange = useCallback((usergroupExpanded: boolean, usergroupId: string) => {
        setExpandedUserGroupId(usergroupExpanded ? usergroupId : undefined);
    }, []);

    const handleUserGroupDelete = useCallback((id: string) => {
        usergroupDeleteTrigger({
            variables: {
                id,
            },
        });
    }, [usergroupDeleteTrigger]);

    // eslint-disable-next-line max-len
    const userGroupRendererParams = useCallback((key: string, datum: UsersGroupType): UserGroupItemProps => ({
        activeUserGroupId: expandedUserGroupId,
        userGroupId: key,
        activeUserId: userId,
        onUserDeleteSuccess: usergroupGetRetrigger,
        onDeleteClick: handleUserGroupDelete,
        onEditClick: handleEditUserGroupClick,
        userGroup: datum,
        onExpansionChange: handleExpansionChange,
        autoFocus: autoFocusUserGroup === datum.id,
        expanded: expandedUserGroupId === datum.id,
        disabled: usergroupDeletePending,
    }), [
        autoFocusUserGroup,
        usergroupDeletePending,
        userId,
        usergroupGetRetrigger,
        handleUserGroupDelete,
        handleEditUserGroupClick,
        handleExpansionChange,
        expandedUserGroupId,
    ]);

    return (
        <Container
            className={_cs(styles.userGroup, className)}
            heading={_ts('usergroup', 'usergroupPageTitle')}
            headerActions={(
                <Button
                    name="addUserGroup"
                    icons={<IoAdd />}
                    onClick={handleAddUserGroupClick}
                >
                    {_ts('usergroup', 'addUsergroupButtonLabel')}
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={userGroupsResponse?.userGroups?.totalCount ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    itemsPerPageControlHidden
                />
            )}
            contentClassName={styles.content}
        >
            <ListView
                className={styles.userGroupList}
                keySelector={usergroupKeySelector}
                data={userGroupsResponse?.userGroups?.results ?? undefined}
                renderer={UserGroupItem}
                rendererParams={userGroupRendererParams}
                rendererClassName={styles.userGroupItem}
                filtered={false}
                pending={usergroupGetPending}
                errored={false}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="experiment"
                    />
                )}
                emptyMessage="No user groups found."
                messageIconShown
                messageShown
            />
            {showAddUserGroupModal && (
                <AddUserGroupModal
                    onModalClose={setUserGroupModalHidden}
                    onSuccess={handleEditUserGroupSuccess}
                    value={usergroupObjectToEdit}
                />
            )}
        </Container>
    );
}

export default UserGroup;
