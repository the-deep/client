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
    TableCell,
    TableCellProps,
    createStringColumn,
    useAlert,
} from '@the-deep/deep-ui';
import _ts from '#ts';
import {
    useLazyRequest,
    useRequest,
} from '#base/utils/restRequest';
import { createDateColumn } from '#components/tableHelpers';
import { useModalState } from '#hooks/stateManagement';
import { MultiResponse } from '#types';

import { UserGroup as UserGroupType, Membership } from '../AddUsergroupModal';
import AddUserModal from './AddUserModal';
import MembershipActionCell, { Props as MembershipActionCellProps } from './MembershipActionCell';
import UserGroupActionCell from './UserGroupActionCell';
import styles from './styles.css';

const MAX_ITEMS_PER_PAGE = 20;
const membershipKeySelector = (d: Membership) => d.id;

interface User {
    id: string;
    member: string;
    role: 'admin' | 'normal';
}

interface Props {
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

    const [activePage, setActivePage] = useState<number>(1);
    const alert = useAlert();

    const [userToEdit, setUserToEdit] = useState<User | undefined>();
    const query = useMemo(() => ({
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
    }), [activePage]);

    const {
        pending: membershipsPending,
        response: memberships,
        retrigger: usersGetTrigger,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://user-groups/${userGroupId}/memberships/`,
        skip: activeUserGroupId !== userGroupId,
        query,
        method: 'GET',
        preserveResponse: true,
    });

    const {
        trigger: memberDeleteTrigger,
    } = useLazyRequest<unknown, string>({
        url: (ctx) => `server://group-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usersGetTrigger();
            onUserDeleteSuccess();
            alert.show(
                'Successfully removed user from user group.',
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                'Failed to  remove user from user group.',
                { variant: 'error' },
            );
        },
    });

    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
    ] = useModalState(false);

    const handleAddMemberClick = useCallback(() => {
        onExpansionChange(true, userGroupId);
        setUserToEdit(undefined);
        setUserModalShow();
    }, [setUserModalShow, onExpansionChange, userGroupId]);

    const handleEditMemberClick = useCallback((
        value: {
            id: string;
            member: string;
            role: 'admin' | 'normal';
        },
    ) => {
        setUserToEdit(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const membersColumns = useMemo(() => {
        const actionColumn: TableColumn<
            Membership,
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
                member: data.member,
                memberRole: data.role,
                groupKey: data.group,
                membershipId,
                onEditClick: handleEditMemberClick,
                onDeleteClick: memberDeleteTrigger,
                disabled: (userGroup.role !== 'admin') || String(data.member) === activeUserId,
            }),
            columnWidth: 96,
        };
        const roleColumn: TableColumn<
            Membership,
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
            createStringColumn<Membership, string>(
                'name',
                _ts('usergroup', 'nameLabel'),
                (item) => item.memberName,
            ),
            createDateColumn<Membership, string>(
                'joinedAt',
                _ts('usergroup', 'addedOnLabel'),
                (item) => item.joinedAt,
            ),
            roleColumn,
            actionColumn,
        ]);
    }, [activeUserId, handleEditMemberClick, memberDeleteTrigger, userGroup]);

    const users = useMemo(() => (
        (memberships?.results ?? []).map((d) => ({
            id: d.member,
            displayName: d.memberName,
            firstName: d.memberName,
            lastName: '',
        }))
    ), [memberships?.results]);

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
                                value={userGroup.membersCount ?? 0}
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
                    disabled={userGroup.role === 'normal'}
                />
            )}
        >
            <Container
                className={styles.membershipsContainer}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={memberships?.count ?? 0}
                        onActivePageChange={setActivePage}
                        maxItemsPerPage={MAX_ITEMS_PER_PAGE}
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
                    data={memberships?.results}
                    errored={false}
                    filtered={false}
                    pending={membershipsPending}
                    messageShown
                    messageIconShown
                />
                {showAddUserModal && (
                    <AddUserModal
                        onModalClose={setUserModalHidden}
                        userGroupId={userGroupId}
                        onUserAddSuccess={usersGetTrigger}
                        userToEdit={userToEdit}
                        users={users}
                    />
                )}
            </Container>
        </ControlledExpandableContainer>
    );
}

export default UserGroupItem;
