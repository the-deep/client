import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import {
    IoChevronForward,
    IoAdd,
} from 'react-icons/io5';
import {
    Container,
    Button,
    Link,
    Kraken,
    Pager,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    useAlert,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import { createDateColumn } from '#components/tableHelpers';
import { useLazyRequest } from '#base/utils/restRequest';
import routes from '#base/configs/routes';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import { useModalState } from '#hooks/stateManagement';

import {
    UserGroup,
} from '#types';
import {
    UserGroupMembersQuery,
    UserGroupMembersQueryVariables,
} from '#generated/types';
import _ts from '#ts';

import AddUserGroupModal from './AddUserGroupModal';

import styles from './styles.css';

const maxItemsPerPage = 10;
const usergroupKeySelector = (d: UserGroup) => d.id;

const USER_GROUP_MEMBERS = gql`
    query UserGroupMembers(
        $id: ID!,
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $id) {
            id
            userGroupMembers(page: $page, pageSize: $pageSize) {
                results {
                  id
                  badges
                  joinedAt
                  addedBy {
                    displayName
                    id
                  }
                  role {
                    id
                    level
                    title
                  }
                  usergroup {
                    clientId
                    id
                    title
                    createdBy {
                      displayName
                      id
                    }
                    memberships {
                      id
                      joinedAt
                      member {
                        id
                        displayName
                      }
                    }
                  }
                }
                totalCount
            }
        }
    }
`;

interface Props {
    className?: string;
    projectId: string;
    activeUserRoleLevel?: number;
    pending?: boolean;
}

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
        activeUserRoleLevel,
        pending = false,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [usergroupIdToEdit, setUsergroupIdToEdit] = useState<string | undefined>(undefined);
    const alert = useAlert();

    const [
        showAddUserGroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalHidden();
    }, [setModalHidden]);

    const userGroupVariables = useMemo(
        (): UserGroupMembersQueryVariables | undefined => ({
            id: projectId,
            page: activePage,
            pageSize: maxItemsPerPage,
        }),
        [projectId, activePage],
    );

    const {
        data: usergroupResponse,
        loading: usergroupPending,
        refetch: triggerUsergroupResponse,
    } = useQuery<UserGroupMembersQuery, UserGroupMembersQueryVariables>(
        USER_GROUP_MEMBERS,
        {
            variables: userGroupVariables,
        },
    );

    const {
        trigger: triggerDeleteUsergroup,
    } = useLazyRequest<unknown, string>({
        url: (ctx) => `server://projects/${projectId}/project-usergroups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerUsergroupResponse();
            alert.show(
                'Successfully deleted user group.',
                { variant: 'success' },
            );
        },
        failureMessage: 'Failed to delete user group.',
    });

    const handleEditUsergroupClick = useCallback((usergroupId) => {
        setUsergroupIdToEdit(usergroupId);
        setModalShow();
    }, [setModalShow]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            UserGroup, string, ActionCellProps<string>, TableHeaderCellProps
        > = {
            id: 'action',
            title: 'Actions',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: (userId, data) => ({
                itemKey: userId,
                onEditClick: handleEditUsergroupClick,
                onDeleteClick: triggerDeleteUsergroup,
                disabled: (
                    isNotDefined(activeUserRoleLevel)
                    || data.role.level < activeUserRoleLevel
                ),
                editButtonTitle: _ts('projectEdit', 'editUsergroupLabel'),
                deleteButtonTitle: _ts('projectEdit', 'deleteUserLabel'),
                deleteConfirmationMessage: _ts('projectEdit', 'removeUserGroupConfirmation'),
            }),
        };

        return ([
            createStringColumn<UserGroup, string>(
                'title',
                _ts('projectEdit', 'group'),
                (item) => item.usergroup.title,
            ),
            createStringColumn<UserGroup, string>(
                'addedByName',
                _ts('projectEdit', 'addedByName'),
                (item) => item.addedBy?.displayName,
            ),
            createDateColumn<UserGroup, string>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                (item) => item.joinedAt,
            ),
            createStringColumn<UserGroup, string>(
                'role',
                'Assigned Role',
                (item) => item.role.title,
            ),
            actionColumn,
        ]);
    }, [triggerDeleteUsergroup, handleEditUsergroupClick, activeUserRoleLevel]);

    const usergroupToEdit = useMemo(() => (
        usergroupResponse?.project?.userGroupMembers?.results?.find(
            (d) => d.id === usergroupIdToEdit,
        )
    ), [usergroupResponse?.project?.userGroupMembers?.results, usergroupIdToEdit]);

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    const routeToUserGroups = generatePath(
        routes.userGroups.path,
        {},
    );

    return (
        <Container
            className={_cs(className, styles.usergroups)}
            heading={_ts('projectEdit', 'userGroup')}
            inlineHeadingDescription
            headingDescription={(
                <Link
                    className={styles.userGroupsLink}
                    to={routeToUserGroups}
                    actions={(
                        <IoChevronForward />
                    )}
                >
                    {_ts('projectEdit', 'manageUserGroup')}
                </Link>
            )}
            contentClassName={styles.content}
            headerActions={(
                <Button
                    variant="tertiary"
                    name="add-usergroup"
                    icons={(
                        <IoAdd />
                    )}
                    onClick={handleAddUsergroupClick}
                    disabled={pending}
                >
                    {_ts('projectEdit', 'addUserGroup')}
                </Button>
            )}
        >
            <TableView
                data={usergroupResponse?.project?.userGroupMembers?.results}
                keySelector={usergroupKeySelector}
                columns={columns}
                emptyMessage={_ts('projectEdit', 'emptyUsergroupTableMessage')}
                rowClassName={styles.tableRow}
                filtered={false}
                errored={false}
                pending={usergroupPending || pending}
                emptyIcon={(
                    <Kraken
                        variant="standby"
                    />
                )}
                messageShown
                messageIconShown
            />
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={usergroupResponse?.project?.userGroupMembers?.totalCount ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
            {showAddUserGroupModal && (
                <AddUserGroupModal
                    onModalClose={handleModalClose}
                    projectId={projectId}
                    onTableReload={triggerUsergroupResponse}
                    usergroupValue={usergroupToEdit}
                    activeUserRoleLevel={activeUserRoleLevel}
                />
            )}
        </Container>
    );
}

export default UserGroupList;
