import React, { useMemo, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Container,
    ContainerCard,
    Pager,
    PendingMessage,
    Table,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
    createNumberColumn,
    useRowExpansion,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import { createDateColumn } from '#dui/tableHelpers';
import {
    activeUserSelector,
} from '#redux';
import {
    useRequest,
    useLazyRequest,
} from '#utils/request';
import {
    AppState,
    MultiResponse,
} from '#typings';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import AddUsergroupModal, {
    Membership,
    Usergroup,
} from './AddUsergroupModal';
import AddUserModal from './AddUserModal';
import AddActionCell, { Props as AddActionCellProps } from './AddEditDeleteActionCell';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

const MAX_ITEMS_PER_PAGE = 10;
const usergroupKeySelector = (d:Usergroup) => d.id;
const membershipKeySelector = (d:Membership) => d.id;

interface Props {
    activeUser: { userId: number };
}

function UserGroup(props: Props) {
    const {
        activeUser,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [activeUsergroupId, setActiveUsergroupId] = useState<number | undefined>();
    const [usergroupToEdit, setUsergroupToEdit] = useState<number | undefined>();
    const [userToEdit, setUserToEdit] = useState<number | undefined>();
    const [member, setMember] = useState<number | undefined>();
    const [
        showAddUserGroupModal,
        setUsergroupModalShow,
        setUsergroupModalHidden,
    ] = useModalState(false);
    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
    ] = useModalState(false);

    const usergroupQuery = useMemo(() => ({
        user: activeUser.userId,
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
    }), [activeUser.userId, activePage]);

    const {
        pending: usergroupGetPending,
        response: usergroupResponse,
        retrigger: usergroupResponseTrigger,
    } = useRequest<MultiResponse<Usergroup>>({
        url: 'server://user-groups/member-of/',
        method: 'GET',
        query: usergroupQuery,
        failureHeader: _ts('usergroup', 'fetchUsergroupFailed'),
    });

    const {
        trigger: usergroupDeleteTrigger,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://user-groups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usergroupResponseTrigger();
        },
        failureHeader: _ts('usergroup', 'usergroupDeleteFailed'),
    });

    const {
        trigger: memberDeleteTrigger,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://group-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usergroupResponseTrigger();
        },
        failureHeader: _ts('usergroup', 'memberDeleteFailed'),
    });

    const usergroupObjectToEdit = useMemo(() => (
        usergroupResponse?.results?.find(a => a.id === usergroupToEdit)
    ), [usergroupResponse?.results, usergroupToEdit]);

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupToEdit(undefined);
        setUsergroupModalShow();
    }, [setUsergroupModalShow]);

    const handleEditUsergroupClick = useCallback((value) => {
        setUsergroupToEdit(value);
        setUsergroupModalShow();
    }, [setUsergroupModalShow]);

    const handleEditUsergroupSuccess = useCallback(() => {
        usergroupResponseTrigger();
        setUsergroupModalHidden();
    }, [setUsergroupModalHidden, usergroupResponseTrigger]);

    const handleMemberAddClick = useCallback((value) => {
        setUserToEdit(undefined);
        setActiveUsergroupId(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const handleEditMemberClick = useCallback((value, group, memberValue) => {
        setUserToEdit(value);
        setMember(memberValue);
        setActiveUsergroupId(group);
        setUserModalShow();
    }, [setUserModalShow]);

    const usergroupMemberOptions = useMemo(() => {
        const user = usergroupResponse
            ?.results
            ?.find(v => v.id === activeUsergroupId)
            ?.memberships
            .map(v => ({
                id: v.member,
                displayName: v.memberName,
                role: v.role,
            }));
        return user;
    }, [usergroupResponse, activeUsergroupId]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            Usergroup,
            number,
            AddActionCellProps<number>,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('usergroup', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: AddActionCell,
            cellRendererParams: (passedUsergroupId, data) => ({
                itemKey: passedUsergroupId,
                onEditClick: handleEditUsergroupClick,
                onDeleteClick: usergroupDeleteTrigger,
                onAddClick: handleMemberAddClick,
                addButtonTitle: _ts('usergroup', 'addMemberLabel'),
                editButtonTitle: _ts('usergroup', 'editUsergroupLabel'),
                deleteButtonTitle: _ts('usergroup', 'deleteUsergroupLabel'),
                deleteConfirmationMessage: _ts('usergroup', 'deleteUsergroupConfirmMessage'),
                disabled: data.role === 'norma;',
            }),
        };

        return ([
            createStringColumn<Usergroup, number>(
                'group',
                _ts('usergroup', 'groupLabel'),
                item => item.title,
            ),
            createNumberColumn<Usergroup, number>(
                'members',
                _ts('usergroup', 'membersLabel'),
                item => item.memberships.length,
                // to be fetched directly from API as membershipCount when done
            ),
            createDateColumn<Usergroup, number>(
                'createdAt',
                _ts('usergroup', 'createdOnLabel'),
                item => item.createdAt,
            ),
            actionColumn,
        ]);
    },
    [
        handleEditUsergroupClick,
        usergroupDeleteTrigger,
        handleMemberAddClick,
    ]);

    const membersColumns = useMemo(() => {
        const actionColumn: TableColumn<
            Membership,
            number,
            AddActionCellProps<number>,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('usergroup', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: AddActionCell,
            cellRendererParams: (passedUserId, data) => ({
                member: data.member,
                groupKey: data.group,
                itemKey: passedUserId,
                onEditClick: handleEditMemberClick,
                onDeleteClick: memberDeleteTrigger,
                editButtonTitle: _ts('usergroup', 'editMemberLabel'),
                deleteButtonTitle: _ts('usergroup', 'deleteMemberLabel'),
                deleteConfirmationMessage: _ts('usergroup', 'deleteMemberConfirmMessage'),
            }),
        };

        return ([
            createStringColumn<Membership, number>(
                'name',
                _ts('usergroup', 'nameLabel'),
                item => item.memberName,
            ),
            createStringColumn<Membership, number>(
                'email',
                _ts('usergroup', 'emailLabel'),
                item => item.memberEmail,
            ),
            createDateColumn<Membership, number>(
                'joinedAt',
                _ts('usergroup', 'addedOnLabel'),
                item => item.joinedAt,
            ),
            createStringColumn<Membership, number>(
                'role',
                _ts('usergroup', 'roleLabel'),
                item => item.role,
            ),
            actionColumn,
        ]);
    }, [handleEditMemberClick, memberDeleteTrigger]);

    const [rowModifier] = useRowExpansion<Usergroup, number>(
        ({ datum }) => (
            <ContainerCard>
                <Table
                    className={styles.expandedTable}
                    columns={membersColumns}
                    keySelector={membershipKeySelector}
                    data={datum.memberships}
                />
            </ContainerCard>
        ),
    );

    return (
        <Container
            className={styles.userGroup}
            heading={_ts('usergroup', 'usergroupPageTitle')}
            headerActions={
                <Button
                    name="addUsergroup"
                    className={styles.addUsergroupButton}
                    icons={<IoAdd />}
                    onClick={handleAddUsergroupClick}
                >
                    {_ts('usergroup', 'addUsergroupButtonLabel')}
                </Button>
            }
            footerActions={
                <Pager
                    activePage={activePage}
                    itemsCount={usergroupResponse?.count ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    itemsPerPageControlHidden
                />
            }
        >
            {usergroupGetPending && <PendingMessage />}
            <Table
                className={styles.usergroupTable}
                columns={columns}
                keySelector={usergroupKeySelector}
                data={usergroupResponse?.results}
                rowModifier={rowModifier}
            />
            {showAddUserGroupModal && (
                <AddUsergroupModal
                    onModalClose={setUsergroupModalHidden}
                    onSuccess={handleEditUsergroupSuccess}
                    value={usergroupObjectToEdit}
                />
            )}
            {showAddUserModal && activeUsergroupId && (
                <AddUserModal
                    onModalClose={setUserModalHidden}
                    group={activeUsergroupId}
                    onUserAddSuccess={usergroupResponseTrigger}
                    memberToEdit={userToEdit}
                    member={member}
                    memberOptions={usergroupMemberOptions}
                />
            )}
        </Container>
    );
}

export default connect(mapStateToProps)(UserGroup);
