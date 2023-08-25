import React, { useMemo, useState, useCallback } from 'react';
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
    createStringColumn,
    useAlert,
} from '@the-deep/deep-ui';
import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import _ts from '#ts';

import { createDateColumn } from '#components/tableHelpers';
import { useModalState } from '#hooks/stateManagement';

import {
    UserGroupType,
    UserGroupMembershipQuery,
    UserGroupMembershipQueryVariables,
    UserGroupMembershipDeleteMutation,
    UserGroupMembershipDeleteMutationVariables,
} from '#generated/types';
import AddUserModal from './AddUserModal';
import MembershipActionCell, { Props as MembershipActionCellProps } from './MembershipActionCell';
import UserGroupActionCell from './UserGroupActionCell';

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
                    emailDisplay
                }
            }
        }
    }
`;

const USER_GROUP_MEMBERSHIP_DELETE = gql`
    mutation UserGroupMembershipDelete(
        $id:ID!,
        $deleteIds: [ID!],
        $items: [BulkUserGroupMembershipInputType!],
    ) {
        userGroup(id: $id) {
            id
            userGroupMembershipBulk(
                deleteIds: $deleteIds,
                items: $items,
            ) {
                errors
                deletedResult {
                    id
                    clientId
                    role
                    roleDisplay
                    member {
                        id
                        displayName
                    }
                }
                result {
                    clientId
                    id
                    member {
                        id
                        displayName
                    }
                    role
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
    userGroup: Pick<UserGroupType, 'createdAt' | 'currentUserRole' | 'title' | 'membershipsCount'>;
    onExpansionChange: (usergroupExpanded: boolean, usergroupId: string) => void;
    expanded?: boolean;
    autoFocus?: boolean;
    disabled?: boolean;
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
        disabled,
    } = props;

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
                if (!response?.userGroup?.userGroupMembershipBulk) {
                    return;
                }
                const {
                    deletedResult,
                } = response.userGroup.userGroupMembershipBulk;

                const [deletedUser] = deletedResult ?? [];

                if (deletedUser) {
                    alert.show(
                        `Successfully removed ${deletedUser.member.displayName} from this project.`,
                        { variant: 'success' },
                    );
                    refetchUserGroupMembers();
                    onUserDeleteSuccess();
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

    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
    ] = useModalState(false);

    const handleMemberDelete = useCallback((id: string) => {
        userGroupMembershipDelete({
            variables: {
                id: userGroupId,
                deleteIds: [id],
            },
        });
    }, [
        userGroupId,
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
                member: data.member.id,
                memberRole: data.role,
                groupKey: data.id,
                membershipId,
                onEditClick: handleEditMemberClick,
                onDeleteClick: handleMemberDelete,
                disabled: (userGroup?.currentUserRole !== 'ADMIN') || data.member.id === activeUserId,
            }),
            columnWidth: 96,
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
            createStringColumn<UserGroupMembership, string>(
                'role',
                'Role',
                (item) => item.roleDisplay,
            ),
            actionColumn,
        ]);
    }, [activeUserId, handleEditMemberClick, handleMemberDelete, userGroup]);

    const users = useMemo(() => (
        (userGroupMembershipResponse?.userGroup?.memberships ?? []).map((d) => ({
            id: d.member?.id,
            displayName: d.member?.displayName,
            emailDisplay: d.member?.emailDisplay,
            firstName: d.member?.firstName,
            lastName: d.member?.lastName,
        }))
    ), [userGroupMembershipResponse?.userGroup?.memberships]);

    return (
        <ControlledExpandableContainer
            name={userGroupId}
            className={_cs(styles.userGroupItem, className)}
            heading={userGroup?.title}
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
                                value={userGroup?.createdAt}
                                format="hh:mm aaa, dd MMM, yyyy"
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
                    disabled={userGroup?.currentUserRole === 'NORMAL' || disabled}
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
