import React, { useCallback, useMemo, useState } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { IoAdd, IoSearch } from 'react-icons/io5';
import {
    Container,
    Button,
    Pager,
    Kraken,
    SortContext,
    TextInput,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    Tag,
    createStringColumn,
    useAlert,
    useSortState,
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
    ProjectRoleTypeEnum,
    ProjectUsersQuery,
    ProjectUsersQueryVariables,
} from '#generated/types';
import { useModalState } from '#hooks/stateManagement';
import { roleLevels } from '#types/project';

import AddUserModal from './AddUserModal';
import styles from './styles.css';

export const PROJECT_MEMBERSHIP_BULK_REMOVE = gql`
    mutation ProjectMembershipBulkRemove($projectId:ID!, $deleteIds: [ID!]) {
        project(id: $projectId) {
            id
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

export const PROJECT_USERS = gql`
    query ProjectUsers(
        $projectId: ID!
        $page: Int,
        $pageSize: Int,
        $ordering: String,
        $search: String,
    ) {
        project(id: $projectId) {
            id
            userMembers(
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                search: $search,
            ) {
                results {
                    badges
                    id
                    joinedAt
                    member {
                        displayName
                        id
                        firstName
                        lastName
                        emailDisplay
                        profile {
                            id
                            organization
                        }
                    }
                    role {
                        id
                        level
                        title
                        type
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

interface Props {
    className?: string;
    projectId: string;
    activeUserId?: string;
    pending?: boolean;
    activeUserRoleLevel?: number;
    activeUserRole?: ProjectRoleTypeEnum;
}

const defaultSorting = {
    name: 'member',
    direction: 'Descending',
};

function UserList(props: Props) {
    const {
        projectId,
        className,
        activeUserId,
        activeUserRoleLevel,
        activeUserRole,
        pending = false,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [projectUserToEdit, setProjectUserToEdit] = useState<ProjectUser>();
    const [searchText, setSearchText] = useState<string | undefined>(undefined);
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

    const sortState = useSortState();
    const { sorting } = sortState;
    const validSorting = sorting || defaultSorting;
    const ordering = useMemo(() => (
        validSorting.direction === 'Ascending'
            ? validSorting.name
            : `-${validSorting.name}`
    ), [validSorting]);

    const projectUsersVariables = useMemo(() => ({
        projectId,
        page: activePage,
        pageSize: maxItemsPerPage,
        ordering,
        search: searchText,
    }
    ), [projectId, activePage, ordering, searchText]);

    const {
        previousData,
        data: projectUsersResponse = previousData,
        loading: projectUsersPending,
        refetch,
    } = useQuery<ProjectUsersQuery, ProjectUsersQueryVariables>(
        PROJECT_USERS,
        {
            variables: projectUsersVariables,
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
                    deletedResult,
                } = response.project.projectUserMembershipBulk;

                const [deletedUser] = deletedResult ?? [];

                if (deletedUser) {
                    alert.show(
                        `Successfully removed ${deletedUser.member.displayName} from this project.`,
                        { variant: 'success' },
                    );
                    refetch();
                } else {
                    alert.show(
                        'There was an issue while removing the user from this project.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to delete membership(s).',
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
                editDisabled: (
                    isNotDefined(activeUserRoleLevel)
                    // FIXME: User level from server after it is ready
                    || activeUserRoleLevel < roleLevels[data.role.type]
                    || bulkDeleteProjectMembershipPending
                ),
                deleteDisabled: (
                    data.member.id === activeUserId
                    || isNotDefined(activeUserRoleLevel)
                    // FIXME: User level from server after it is ready
                    || activeUserRoleLevel < roleLevels[data.role.type]
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
                'member',
                _ts('projectEdit', 'memberName'),
                (item) => item.member.displayName,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ProjectUser, string>(
                'memberOrganization',
                _ts('projectEdit', 'memberOrganization'),
                (item) => item.member.profile.organization,
            ),
            createStringColumn<ProjectUser, string>(
                'memberEmail',
                _ts('projectEdit', 'memberEmail'),
                (item) => item.member.emailDisplay,
            ),
            createStringColumn<ProjectUser, string>(
                'addedBy',
                _ts('projectEdit', 'addedByName'),
                (item) => item.addedBy?.displayName,
                {
                    sortable: true,
                },
            ),
            createDateColumn<ProjectUser, string>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                (item) => item.joinedAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ProjectUser, string>(
                'role',
                'Assigned Role',
                (item) => item?.role.title,
                {
                    sortable: true,
                },
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
            headerActionsContainerClassName={styles.headerActions}
            headerActions={(
                <>
                    <TextInput
                        name={undefined}
                        value={searchText}
                        onChange={setSearchText}
                        placeholder="Search"
                        icons={(<IoSearch />)}
                        variant="general"
                    />
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
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <TableView
                    className={styles.table}
                    data={projectUsersResponse?.project?.userMembers?.results}
                    keySelector={userKeySelector}
                    emptyMessage={_ts('projectEdit', 'emptyUserTableMessage')}
                    rowClassName={styles.tableRow}
                    columns={columns}
                    filtered={(searchText?.length ?? 0) > 0}
                    errored={false}
                    pending={projectUsersPending || pending}
                    filteredEmptyMessage="No users found"
                    emptyIcon={(
                        <Kraken
                            variant="standby"
                        />
                    )}
                    messageShown
                    messageIconShown
                />
            </SortContext.Provider>
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
                    activeUserId={activeUserId}
                    activeUserRole={activeUserRole}
                />
            )}
        </Container>
    );
}
export default UserList;
