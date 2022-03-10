import React, { useContext, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Pager,
    Container,
    TableView,
    TextOutput,
    NumberOutput,
    DateOutput,
    ControlledExpandableContainer,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    TableCell,
    TableCellProps,
    createStringColumn,
    useAlert,
} from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import _ts from '#ts';

import { ProjectContext } from '#base/context/ProjectContext';
import { createDateColumn } from '#components/tableHelpers';
import { useModalState } from '#hooks/stateManagement';

import AddUserModal from './AddUserModal';
import MembershipActionCell, { Props as MembershipActionCellProps } from './MembershipActionCell';
import UserGroupActionCell from './UserGroupActionCell';
import {
    UserGroupType,
    UserGroupMembershipQuery,
    UserGroupMembershipQueryVariables,
    UserGroupMembershipDeleteMutation,
    UserGroupMembershipDeleteMutationVariables,
} from '#generated/types';
import styles from './styles.css';

const USER_GROUP_MEMBERSHIP = gql`
    query UserGroupMembership(
        $id: ID!,
    ) {
        userGroup(
            id: $id,
        ) {
            id
            title
            membershipsCount
            memberships {
                id
                joinedAt
                role
                roleDisplay
                member {
                id
                firstName
                lastName
                displayName
                organization
                }
            }
        }
    }
`;

const USER_GROUP_MEMBERSHIP_DELETE = gql`
    mutation UserGroupMembershipDelete(
        $projectId:ID!,
        $deleteIds: [ID!],
        $items: [BulkProjectUserGroupMembershipInputType!],
        ) {
        project(
            id: $projectId,
        ) {
            id
            projectUserGroupMembershipBulk(
                deleteIds: $deleteIds,
                items: $items,
            ) {
                errors
                deletedResult {
                    usergroup {
                      id
                      memberships {
                        id
                        role
                        member {
                          id
                          displayName
                        }
                      }
                    }
                }
            }
        }
    }
`;

export type UserGroupMembership = NonNullable<NonNullable<UserGroupMembershipQuery['userGroup']>['memberships']>[number];
export type UserGroupMember = NonNullable<UserGroupMembership['member']>;

const maxItemsPerPage = 20;
const membershipKeySelector = (d: UserGroupMembership) => d.id;

interface User {
    id: string;
    member: string;
    role: 'ADMIN' | 'NORMAL';
}

export interface Props {
    className?: string;
    activeUserGroupId?: string;
    userGroupId: string;
    activeUserId?: string;
    onUserDeleteSuccess: () => void;
    onEditClick: (id: string) => void;
    onDeleteClick: (id: string) => void;
    userGroup: UserGroupType;
    onExpansionChange: (usergroupExpanded: boolean, usergroupId: string) => void;
    expanded?: boolean;
    autoFocus?: boolean;
}

function UserGroupItem(props: Props) {
    const {
        className,
        activeUserGroupId,
        userGroupId,
        onEditClick,
        onDeleteClick,
        userGroup,
        activeUserId,
        onUserDeleteSuccess,
        onExpansionChange,
        expanded,
        autoFocus,
    } = props;

    const { project } = useContext(ProjectContext);
    const [activePage, setActivePage] = useState<number>(1);
    const alert = useAlert();

    const [userToEdit, setUserToEdit] = useState<User | undefined>();

    const userGroupMemberVariables = useMemo(() => ({
        id: userGroupId as string,
        page: activePage,
        pageSize: maxItemsPerPage,
    }
    ), [
        activePage,
        userGroupId,
    ]);

    const {
        previousData,
        data: userGroupMembershipResponse = previousData,
        loading: userGroupMembershipPending,
        refetch: refetchUserGroupMembers,
    } = useQuery<UserGroupMembershipQuery, UserGroupMembershipQueryVariables>(
        USER_GROUP_MEMBERSHIP,
        {
            variables: userGroupMemberVariables,
            skip: activeUserGroupId !== userGroupId,
        },
    );

    const [
        userGroupMembershipDelete,
    ] = useMutation<
        UserGroupMembershipDeleteMutation,
        UserGroupMembershipDeleteMutationVariables
    >(
        USER_GROUP_MEMBERSHIP_DELETE,
        {
            onCompleted: (response) => {
                if (!response?.project?.projectUserGroupMembershipBulk) {
                    return;
                }
                const {
                    errors,
                    deletedResult,
                } = response.project.projectUserGroupMembershipBulk;

                const [err] = errors ?? [];
                const [deletedUser] = deletedResult ?? [];
                console.log('Delete user GQL::>>', deletedResult);

                if (deletedUser) {
                    alert.show(
                        `Successfully removed ${deletedUser.usergroup.memberships} from this project.`,
                        { variant: 'success' },
                    );
                    refetchUserGroupMembers();
                    onUserDeleteSuccess();
                } else {
                    alert.show(
                        err ?? 'There was an issue while removing the user from this project.',
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

    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
    ] = useModalState(false);

    const handleMemberDelete = useCallback((id: string) => {
        userGroupMembershipDelete({
            variables: {
                projectId: project?.id as string,
                deleteIds: [id],
            },
        });
    }, [
        project?.id,
        userGroupMembershipDelete,
    ]);

    const handleAddMemberClick = useCallback(() => {
        onExpansionChange(true, userGroupId);
        setUserToEdit(undefined);
        setUserModalShow();
    }, [setUserModalShow, onExpansionChange, userGroupId]);

    const handleEditMemberClick = useCallback((
        value: {
            id: string;
            member: string;
            role: 'ADMIN' | 'NORMAL';
        },
    ) => {
        setUserToEdit(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const membersColumns = useMemo(() => {
        const actionColumn: TableColumn<
            UserGroupMembership,
            string,
            MembershipActionCellProps,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: '',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: MembershipActionCell,
            cellRendererParams: (membershipId, data) => ({
                member: data.id,
                memberRole: data.role,
                groupKey: data.id,
                membershipId,
                onEditClick: handleEditMemberClick,
                onDeleteClick: handleMemberDelete,
                disabled: (userGroup?.currentUserRole !== 'ADMIN') || String(data) === activeUserId,
            }),
            columnWidth: 96,
        };
        const roleColumn: TableColumn<
            UserGroupMembership,
            string,
            TableCellProps<string>,
            TableHeaderCellProps
        > = {
            id: 'role',
            title: 'Role',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: TableCell,
            cellRendererClassName: styles.role,
            cellRendererParams: (_, data) => ({
                value: data.role,
            }),
        };
        return ([
            createStringColumn<UserGroupMembership, string>(
                'name',
                _ts('usergroup', 'nameLabel'),
                (item) => item.member?.displayName,
            ),
            createDateColumn<UserGroupMembership, string>(
                'joinedAt',
                _ts('usergroup', 'addedOnLabel'),
                (item) => item.joinedAt,
            ),
            roleColumn,
            actionColumn,
        ]);
    }, [activeUserId, handleEditMemberClick, handleMemberDelete, userGroup]);

    const users = useMemo(() => (
        (userGroupMembershipResponse?.userGroup?.memberships ?? []).map((d) => ({
            id: d.id,
            displayName: d.member?.displayName,
            firstName: d.member?.firstName,
            lastName: d.member?.lastName,
        }))
    ), [userGroupMembershipResponse?.userGroup?.memberships]);

    return (
        <ControlledExpandableContainer
            name={userGroupId}
            className={_cs(styles.userGroupItem, className)}
            heading={userGroup.title}
            autoFocus={autoFocus}
            withoutBorder
            spacing="comfortable"
            expansionTriggerArea="arrow"
            onExpansionChange={onExpansionChange}
            expanded={expanded}
            inlineHeadingDescription
            headerClassName={styles.userGroupHeader}
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            headerDescriptionClassName={styles.headingDescriptionContainer}
            contentClassName={styles.userGroupContent}
            headingDescription={(
                <>
                    <TextOutput
                        label="Created On"
                        value={(
                            <DateOutput
                                value={userGroup.createdAt}
                                format="hh:mm aaa, MMM dd, yyyy"
                            />
                        )}
                        hideLabelColon
                    />
                    <TextOutput
                        label="Members"
                        labelContainerClassName={styles.membersLabel}
                        valueContainerClassName={styles.membersValue}
                        value={(
                            <NumberOutput
                                value={userGroup?.membershipsCount ?? 0}
                            />
                        )}
                        hideLabelColon
                    />
                </>
            )}
            headerActions={(
                <UserGroupActionCell
                    itemKey={userGroupId}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onAddClick={handleAddMemberClick}
                    addButtonTitle={_ts('usergroup', 'addMemberLabel')}
                    editButtonTitle={_ts('usergroup', 'editUserGroupLabel')}
                    deleteButtonTitle={_ts('usergroup', 'deleteUserGroupLabel')}
                    deleteConfirmationMessage={_ts('usergroup', 'deleteUsergroupConfirmMessage')}
                    disabled={userGroup.currentUserRole === 'NORMAL'}
                />
            )}
        >
            <Container
                className={styles.membershipsContainer}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={userGroupMembershipResponse?.userGroup?.membershipsCount ?? 0}
                        onActivePageChange={setActivePage}
                        maxItemsPerPage={maxItemsPerPage}
                        itemsPerPageControlHidden
                    />
                )}
                contentClassName={styles.content}
            >
                <TableView
                    className={styles.expandedTable}
                    columns={membersColumns}
                    keySelector={membershipKeySelector}
                    headerCellClassName={styles.headerCell}
                    data={userGroupMembershipResponse?.userGroup?.memberships}
                    errored={false}
                    filtered={false}
                    pending={userGroupMembershipPending}
                    messageShown
                    messageIconShown
                />
                {showAddUserModal && (
                    <AddUserModal
                        onModalClose={setUserModalHidden}
                        userGroupId={userGroupId}
                        onUserAddSuccess={refetchUserGroupMembers}
                        userToEdit={userToEdit}
                        users={users}
                    />
                )}
            </Container>
        </ControlledExpandableContainer>
    );
}

export default UserGroupItem;
