import React, { useMemo, useState, useCallback } from 'react';
import {
    Pager,
    PendingMessage,
    Container,
    TableView,
    TableColumn,
    TableHeaderCellProps,
    TableHeaderCell,
    createStringColumn,
} from '@the-deep/deep-ui';

import {
    useLazyRequest,
    useRequest,
} from '#utils/request';
import { createDateColumn } from '#newComponents/ui/tableHelpers';

import { useModalState } from '#hooks/stateManagement';
import { MultiResponse } from '#types';
import _ts from '#ts';

import AddUserModal from '../AddUserModal';
import { Membership } from '../AddUsergroupModal';
import MembershipActionCell, { Props as MembershipActionCellProps } from '../MembershipActionCell';

import styles from './styles.scss';

const MAX_ITEMS_PER_PAGE = 20;
const membershipKeySelector = (d: Membership) => d.id;

interface User {
    id: number;
    member: number;
    role: 'admin' | 'normal';
}

interface Props {
    userGroup?: number;
    canEdit: boolean;
    activeUserId: number;
    onUserDeleteSuccess: () => void;
}

function Memberships(props: Props) {
    const {
        userGroup,
        canEdit,
        activeUserId,
        onUserDeleteSuccess,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);

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
        url: `server://user-groups/${userGroup}/memberships/`,
        query,
        method: 'GET',
        failureHeader: 'User group memberships',
    });

    const {
        trigger: memberDeleteTrigger,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://group-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usersGetTrigger();
            onUserDeleteSuccess();
        },
        failureHeader: _ts('usergroup', 'memberDeleteFailed'),
    });


    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
    ] = useModalState(false);

    const handleEditMemberClick = useCallback((
        value: {
            id: number;
            member: number;
            role: 'admin' | 'normal';
        },
    ) => {
        setUserToEdit(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const membersColumns = useMemo(() => {
        const actionColumn: TableColumn<
            Membership,
            number,
            MembershipActionCellProps,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('usergroup', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: MembershipActionCell,
            cellRendererParams: (passedUserId, data) => ({
                member: data.member,
                memberRole: data.role,
                groupKey: data.group,
                itemKey: passedUserId,
                onEditClick: handleEditMemberClick,
                onDeleteClick: memberDeleteTrigger,
                editButtonTitle: _ts('usergroup', 'editMemberLabel'),
                deleteButtonTitle: _ts('usergroup', 'deleteMemberLabel'),
                deleteConfirmationMessage: _ts('usergroup', 'deleteMemberConfirmMessage'),
                disabled: !canEdit || data.member === activeUserId,
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
    }, [activeUserId, canEdit, handleEditMemberClick, memberDeleteTrigger]);

    const users = useMemo(() => (
        memberships?.results.map(d => ({
            id: d.member,
            displayName: d.memberName,
        }))
    ), [memberships?.results]);

    return (
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
            horizontallyCompactContent
        >
            {membershipsPending && <PendingMessage />}
            <TableView
                className={styles.expandedTable}
                columns={membersColumns}
                keySelector={membershipKeySelector}
                data={memberships?.results}
            />
            {showAddUserModal && userGroup && (
                <AddUserModal
                    onModalClose={setUserModalHidden}
                    group={userGroup}
                    onUserAddSuccess={usersGetTrigger}
                    userToEdit={userToEdit}
                    users={users}
                />
            )}
        </Container>
    );
}

export default Memberships;
