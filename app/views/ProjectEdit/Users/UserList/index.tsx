import React, { useCallback, useMemo, useState } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Container,
    Button,
    Pager,
    TableView,
    PendingMessage,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    Tag,
    createStringColumn,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useQuery,
    useMutation,
    gql,
} from '@apollo/client';
import { createDateColumn } from '#components/tableHelpers';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import _ts from '#ts';

import {
    ProjectMembershipBulkRemoveMutation,
    ProjectMembershipBulkRemoveMutationVariables,
    ProjectUsersQuery,
    ProjectUsersQueryVariables,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';

import AddUserModal from './AddUserModal';
import styles from './styles.css';

const PROJECT_MEMBERSHIP_BULK_REMOVE = gql`
    mutation ProjectMembershipBulkRemove($projectId:ID!, $deleteIds: [ID!]) {
        project(id: $projectId) {
            projectUserMembershipBulk(deleteIds: $deleteIds) {
                errors
                deletedResult {
                    id
                    member {
                        displayName
                        id
                    }
                }
            }
        }
    }
`;

const PROJECT_USERS = gql`
    query ProjectUsers(
        $projectId: ID!
        $page: Int,
        $pageSize: Int,
    ) {
        project(id: $projectId) {
            userMembers(page: $page, pageSize: $pageSize) {
                results {
                    badges
                    id
                    joinedAt
                    member {
                        displayName
                        id
                        organization
                        firstName
                        lastName
                    }
                    role {
                        id
                        level
                        title
                    }
                    addedBy {
                        displayName
                        id
                    }
                }
                totalCount
            }
        }
    }
`;

export type ProjectUser = NonNullable<NonNullable<NonNullable<ProjectUsersQuery['project']>['userMembers']>['results']>[number];
const maxItemsPerPage = 10;
const userKeySelector = (d: ProjectUser) => d.id;

interface BadgeListProps {
    className?: string;
    badges?: string[];
}

function BadgeList(props: BadgeListProps) {
    const { badges, className } = props;

    return (
        <div className={className}>
            {
                badges?.map((v) => (
                    <Tag
                        key={v}
                        className={styles.tag}
                        variant="complement1"
                    >
                        {v}
                    </Tag>
                ))
            }
        </div>
    );
}

interface Props{
    className?: string;
    projectId: string;
    activeUserId?: string;
    activeUserRoleLevel?: number;
    pending?: boolean;
}

function UserList(props: Props) {
    const {
        projectId,
        className,
        activeUserId,
        activeUserRoleLevel,
        pending,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [projectUserToEdit, setProjectUserToEdit] = useState<ProjectUser>();
    const alert = useAlert();

    const [
        showAddUserModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setProjectUserToEdit(undefined);
        setModalHidden();
    }, [setModalHidden]);

    const variables = useMemo(() => ({
        projectId,
        page: activePage,
        pageSize: maxItemsPerPage,

    }
    ), [projectId, activePage]);

    const {
        data: projectUsersResponse,
        loading: projectUsersPending,
        refetch,
    } = useQuery<ProjectUsersQuery, ProjectUsersQueryVariables>(
        PROJECT_USERS,
        {
            variables,
        },
    );

    const [
        bulkDeleteProjectMembership,
        { loading: bulkDeleteProjectMembershipPending },
    ] = useMutation<
        ProjectMembershipBulkRemoveMutation,
        ProjectMembershipBulkRemoveMutationVariables
    >(
        PROJECT_MEMBERSHIP_BULK_REMOVE,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUserMembershipBulk) {
                    return;
                }
                const {
                    errors,
                    deletedResult,
                } = response.project.projectUserMembershipBulk;

                const [err] = errors ?? [];
                const [deletedUser] = deletedResult ?? [];
                if (err) {
                    alert.show(
                        err,
                        { variant: 'error' },
                    );
                }
                if (deletedUser) {
                    alert.show(
                        `Successfully deleted ${deletedUser.member.displayName}`,
                        { variant: 'success' },
                    );
                    refetch();
                }
            },
            onError: (gqlError) => {
                alert.show(
                    gqlError.message,
                    { variant: 'error' },
                );
            },
        },
    );
    const handleRemoveUserFromProject = useCallback((id: string) => {
        bulkDeleteProjectMembership({
            variables: {
                projectId,
                deleteIds: [id],
            },
        });
    }, [bulkDeleteProjectMembership, projectId]);

    const handleEditProjectUserClick = useCallback((id: string) => {
        const user = projectUsersResponse?.project?.userMembers?.results?.find((v) => v.id === id);
        setProjectUserToEdit(user);
        setModalShow();
    }, [setModalShow, projectUsersResponse?.project?.userMembers?.results]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            ProjectUser, string, ActionCellProps<string>, TableHeaderCellProps
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
                onEditClick: handleEditProjectUserClick,
                onDeleteClick: handleRemoveUserFromProject,
                disabled: (
                    data.member.id === activeUserId
                    || isNotDefined(activeUserRoleLevel)
                    || data.role.level < activeUserRoleLevel
                    || bulkDeleteProjectMembershipPending
                ),
                editButtonTitle: _ts('projectEdit', 'editUserLabel'),
                deleteButtonTitle: _ts('projectEdit', 'deleteUserLabel'),
                deleteConfirmationMessage: _ts('projectEdit', 'removeUserConfirmation'),
            }),
        };
        const badgeColumn: TableColumn<
            ProjectUser, string, BadgeListProps, TableHeaderCellProps
        > = {
            id: 'badges',
            title: 'Badges',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: BadgeList,
            cellRendererClassName: styles.badgeContainer,
            cellRendererParams: (_, data) => ({
                badges: data.badges ?? undefined,
            }),
        };

        return ([
            createStringColumn<ProjectUser, string>(
                'memberName',
                _ts('projectEdit', 'memberName'),
                (item) => item.member.displayName,
            ),
            createStringColumn<ProjectUser, string>(
                'memberEmail',
                _ts('projectEdit', 'memberEmail'),
                (item) => item.member.displayName, // member email
            ),
            createStringColumn<ProjectUser, string>(
                'memberOrganization',
                _ts('projectEdit', 'memberOrganization'),
                (item) => item.member.organization,
            ),
            createStringColumn<ProjectUser, string>(
                'addedByName',
                _ts('projectEdit', 'addedByName'),
                (item) => item.addedBy?.displayName,
            ),
            createDateColumn<ProjectUser, string>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                (item) => item.joinedAt,
            ),
            createStringColumn<ProjectUser, string>(
                'role',
                'Assigned Role',
                (item) => item?.role.title,
            ),
            badgeColumn,
            actionColumn,
        ]);
    }, [
        handleEditProjectUserClick,
        activeUserId,
        activeUserRoleLevel,
        handleRemoveUserFromProject,
        bulkDeleteProjectMembershipPending,
    ]);

    const handleAddUserClick = setModalShow;

    return (
        <Container
            className={_cs(className, styles.users)}
            heading={_ts('projectEdit', 'projectUsers')}
            contentClassName={styles.content}
            headerActions={(
                <Button
                    name="add-member"
                    variant="tertiary"
                    icons={(
                        <IoAdd />
                    )}
                    onClick={handleAddUserClick}
                    disabled={pending}
                >
                    {_ts('projectEdit', 'addUser')}
                </Button>
            )}
        >
            {(projectUsersPending || pending) && (<PendingMessage />)}
            <TableView
                data={projectUsersResponse?.project?.userMembers?.results}
                keySelector={userKeySelector}
                emptyMessage={_ts('projectEdit', 'emptyUserTableMessage')}
                rowClassName={styles.tableRow}
                columns={columns}
            />
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={projectUsersResponse?.project?.userMembers?.totalCount ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
            {showAddUserModal && (
                <AddUserModal
                    onModalClose={handleModalClose}
                    projectId={projectId}
                    onProjectUserChange={refetch}
                    projectUserToEdit={projectUserToEdit}
                    activeUserRoleLevel={activeUserRoleLevel}
                />
            )}
        </Container>
    );
}
export default UserList;
