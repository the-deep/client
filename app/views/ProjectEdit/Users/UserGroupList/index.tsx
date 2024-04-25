import React, { useCallback, useMemo, useState } from 'react';
import { generatePath } from 'react-router-dom';
import {
    IoChevronForward,
    IoAdd,
    IoSearch,
} from 'react-icons/io5';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
    Container,
    Button,
    Link,
    Kraken,
    Pager,
    TextInput,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    SortContext,
    createStringColumn,
    useAlert,
    useSortState,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#components/tableHelpers';
import routes from '#base/configs/routes';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import { useModalState } from '#hooks/stateManagement';
import {
    ProjectUsergroupsQuery,
    ProjectUsergroupsQueryVariables,
    ProjectUsergroupMembershipRemoveMutation,
    ProjectUsergroupMembershipRemoveMutationVariables,
    ProjectRoleTypeEnum,
} from '#generated/types';
import { roleLevels } from '#types/project';
import _ts from '#ts';

import AddUserGroupModal from './AddUserGroupModal';

import styles from './styles.css';

const PROJECT_USERGROUP_MEMBERSHIP_REMOVE = gql`
    mutation ProjectUsergroupMembershipRemove($projectId: ID!, $deleteIds: [ID!]) {
        project(id: $projectId) {
            id
            projectUserGroupMembershipBulk(deleteIds: $deleteIds) {
                errors
                deletedResult {
                    id
                    usergroup {
                        id
                        title
                    }
                }
            }
        }
    }
`;

const PROJECT_USERGROUPS = gql`
    query ProjectUsergroups(
        $projectId: ID!,
        $page: Int = 1,
        $pageSize: Int,
        $ordering: String,
        $search: String,
    ) {
        project(id: $projectId) {
            id
            userGroupMembers(
                page: $page,
                pageSize: $pageSize,
                ordering: $ordering,
                search: $search,
            ) {
                page
                pageSize
                totalCount
                results {
                    id
                    joinedAt
                    role {
                        id
                        title
                        level
                        type
                    }
                    usergroup {
                        id
                        title
                        modifiedAt
                        modifiedBy {
                            id
                            displayName
                        }
                    }
                }
            }
        }
    }
`;

export type ProjectUsergroup = NonNullable<NonNullable<NonNullable<ProjectUsergroupsQuery['project']>['userGroupMembers']>['results']>[number];
const usergroupsKeySelector = (d: ProjectUsergroup) => d.id;
const maxItemsPerPage = 10;
const defaultSorting = {
    name: 'usergroup',
    direction: 'Descending',
};

interface Props {
    className?: string;
    projectId: string;
    pending?: boolean;
    activeUserRoleLevel?: number;
    activeUserRole?: ProjectRoleTypeEnum;
}

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
        activeUserRoleLevel,
        activeUserRole,
        pending = false,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [searchText, setSearchText] = useState<string | undefined>(undefined);
    const [
        projectUsergroupToEdit,
        setProjectUsergroupToEdit,
    ] = useState<ProjectUsergroup | undefined>();
    const alert = useAlert();

    const [
        showAddUserGroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setProjectUsergroupToEdit(undefined);
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

    const projectUsergroupVariables = useMemo(() => ({
        projectId,
        page: activePage,
        pageSize: maxItemsPerPage,
        search: searchText,
        ordering,
    }), [projectId, activePage, ordering, searchText]);

    const {
        previousData,
        data: usergroups = previousData,
        loading: usergroupPending,
        refetch: refetchUsergroups,
    } = useQuery<ProjectUsergroupsQuery, ProjectUsergroupsQueryVariables>(
        PROJECT_USERGROUPS,
        {
            variables: projectUsergroupVariables,
        },
    );

    const [
        deleteUsergroupMembership,
        { loading: deleteUsergroupMembershipPending },
    ] = useMutation<
        ProjectUsergroupMembershipRemoveMutation,
        ProjectUsergroupMembershipRemoveMutationVariables
    >(
        PROJECT_USERGROUP_MEMBERSHIP_REMOVE,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUserGroupMembershipBulk) {
                    return;
                }
                const {
                    deletedResult,
                } = response.project.projectUserGroupMembershipBulk;

                const [deletedUsergroup] = deletedResult ?? [];

                if (deletedResult) {
                    alert.show(
                        `Successfully deleted ${deletedUsergroup.usergroup.title}`,
                        { variant: 'success' },
                    );
                    refetchUsergroups();
                } else {
                    alert.show(
                        'Error deleting usergroup.',
                        { variant: 'error' },
                    );
                }
            },
        },
    );

    const handleEditProjectUsergroupClick = useCallback((id: string) => {
        const usergroup = usergroups?.project?.userGroupMembers?.results?.find((v) => v.id === id);
        setProjectUsergroupToEdit(usergroup);
        setModalShow();
    }, [setModalShow, usergroups?.project?.userGroupMembers?.results]);

    const handleRemoveUsergroupFromProject = useCallback((id: string) => {
        deleteUsergroupMembership({
            variables: {
                projectId,
                deleteIds: [id],
            },
        });
    }, [deleteUsergroupMembership, projectId]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            ProjectUsergroup, string, ActionCellProps<string>, TableHeaderCellProps
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
                onEditClick: handleEditProjectUsergroupClick,
                onDeleteClick: handleRemoveUsergroupFromProject,
                disabled: (
                    isNotDefined(activeUserRoleLevel)
                    // FIXME: User level from server after it is ready
                    || activeUserRoleLevel < roleLevels[data.role.type]
                    || deleteUsergroupMembershipPending
                ),
                editButtonTitle: _ts('projectEdit', 'editUsergroupLabel'),
                deleteButtonTitle: _ts('projectEdit', 'deleteUserLabel'),
                deleteConfirmationMessage: _ts('projectEdit', 'removeUserGroupConfirmation'),
            }),
        };

        return ([
            createStringColumn<ProjectUsergroup, string>(
                'usergroup',
                _ts('projectEdit', 'group'),
                (item) => item.usergroup.title,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ProjectUsergroup, string>(
                'addedBy',
                _ts('projectEdit', 'addedByName'),
                (item) => item.usergroup.modifiedBy?.displayName,
                {
                    sortable: true,
                },
            ),
            createDateColumn<ProjectUsergroup, string>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                (item) => item.usergroup.modifiedAt,
                {
                    sortable: true,
                },
            ),
            createStringColumn<ProjectUsergroup, string>(
                'role',
                'Assigned Role',
                (item) => item.role.title,
                {
                    sortable: true,
                },
            ),
            actionColumn,
        ]);
    }, [
        handleRemoveUsergroupFromProject,
        handleEditProjectUsergroupClick,
        activeUserRoleLevel,
        deleteUsergroupMembershipPending,
    ]);

    const handleAddUsergroupClick = useCallback(() => {
        setProjectUsergroupToEdit(undefined);
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
            headerActionsContainerClassName={styles.headerActions}
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
                </>
            )}
        >
            <SortContext.Provider value={sortState}>
                <TableView
                    className={styles.table}
                    data={usergroups?.project?.userGroupMembers?.results}
                    keySelector={usergroupsKeySelector}
                    columns={columns}
                    emptyMessage={_ts('projectEdit', 'emptyUsergroupTableMessage')}
                    rowClassName={styles.tableRow}
                    filtered={(searchText?.length ?? 0) > 0}
                    filteredEmptyMessage="No user groups found"
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
            </SortContext.Provider>
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={usergroups?.project?.userGroupMembers?.totalCount ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
            {showAddUserGroupModal && (
                <AddUserGroupModal
                    onModalClose={handleModalClose}
                    projectId={projectId}
                    onTableReload={refetchUsergroups}
                    projectUsergroupToEdit={projectUsergroupToEdit ?? undefined}
                    activeUserRole={activeUserRole}
                />
            )}
        </Container>
    );
}

export default UserGroupList;
