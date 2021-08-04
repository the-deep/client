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
    createStringColumn,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#newComponents/ui/tableHelpers';
import { useRequest, useLazyRequest } from '#utils/request';
import ActionCell, { Props as ActionCellProps } from '#newComponents/ui/EditDeleteActionCell';
import _ts from '#ts';

import { useModalState } from '#hooks/stateManagement';
import {
    Membership,
    MultiResponse,
} from '#types';

import AddUserModal from './AddUserModal';
import styles from './styles.scss';

const maxItemsPerPage = 10;
const userKeySelector = (d: Membership) => d.id;

interface Props{
    className?: string;
    projectId: number;
    activeUserId: number;
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
    const [membershipIdToEdit, setMembershipIdToEdit] = useState<number | undefined>(undefined);

    const [
        showAddUserModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setMembershipIdToEdit(undefined);
        setModalHidden();
    }, [setModalHidden]);

    const queryForRequest = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);
    const {
        pending: usersPending,
        response: usersResponse,
        retrigger: triggerGetUsers,
    } = useRequest<MultiResponse<Membership>>({
        url: `server://projects/${projectId}/project-memberships/`,
        method: 'GET',
        query: queryForRequest,
        failureHeader: _ts('projectEdit', 'userFetchFailed'),
    });

    const {
        trigger: triggerMembershipDelete,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://projects/${projectId}/project-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerGetUsers();
        },
        failureHeader: _ts('projectEdit', 'membershipDeleteFailed'),
    });

    const handleEditMembershipClick = useCallback((membershipId) => {
        setMembershipIdToEdit(membershipId);
        setModalShow();
    }, [setModalShow]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            Membership, number, ActionCellProps<number>, TableHeaderCellProps
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
                onEditClick: handleEditMembershipClick,
                onDeleteClick: triggerMembershipDelete,
                disabled: (
                    data.member === activeUserId
                    || isNotDefined(activeUserRoleLevel)
                    || data.roleDetails.level < activeUserRoleLevel
                ),
                editButtonTitle: _ts('projectEdit', 'editUserLabel'),
                deleteButtonTitle: _ts('projectEdit', 'deleteUserLabel'),
                deleteConfirmationMessage: _ts('projectEdit', 'removeUserConfirmation'),
            }),
        };

        return ([
            createStringColumn<Membership, number>(
                'memberName',
                _ts('projectEdit', 'memberName'),
                item => item.memberName,
            ),
            createStringColumn<Membership, number>(
                'memberEmail',
                _ts('projectEdit', 'memberEmail'),
                item => item.memberEmail,
            ),
            createStringColumn<Membership, number>(
                'memberOrganization',
                _ts('projectEdit', 'memberOrganization'),
                item => item.memberOrganization,
            ),
            createStringColumn<Membership, number>(
                'addedByName',
                _ts('projectEdit', 'addedByName'),
                item => item.addedByName,
            ),
            createDateColumn<Membership, number>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                item => item.joinedAt,
            ),
            createStringColumn<Membership, number>(
                'role',
                'Assigned Role',
                item => item?.roleDetails.title,
            ),
            actionColumn,
        ]);
    }, [triggerMembershipDelete, handleEditMembershipClick, activeUserId, activeUserRoleLevel]);

    const membershipToEdit = useMemo(() => (
        usersResponse?.results?.find(d => d.id === membershipIdToEdit)
    ), [usersResponse?.results, membershipIdToEdit]);

    const handleAddUserClick = setModalShow;

    return (
        <Container
            className={_cs(className, styles.users)}
            heading={_ts('projectEdit', 'projectUsers')}
            headingClassName={styles.heading}
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
            {(usersPending || pending) && (<PendingMessage />)}
            <TableView
                data={usersResponse?.results}
                keySelector={userKeySelector}
                emptyMessage={_ts('projectEdit', 'emptyUserTableMessage')}
                columns={columns}
            />
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={usersResponse?.count ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
            {showAddUserModal &&
                <AddUserModal
                    onModalClose={handleModalClose}
                    projectId={projectId}
                    onTableReload={triggerGetUsers}
                    userValue={membershipToEdit}
                    activeUserRoleLevel={activeUserRoleLevel}
                />
            }
        </Container>
    );
}
export default UserList;
