import React, { useContext, useState, useCallback, useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Pager,
    Button,
    Container,
    PendingMessage,
    createStringColumn,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#components/tableHelpers';
import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';
import { useModalState } from '#hooks/stateManagement';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import {
    MultiResponse,
} from '#types';
import _ts from '#ts';
import UserContext from '#base/context/UserContext';

import { Framework } from '#types/newAnalyticalFramework';

import AddUserModal from './AddUserModal';
import styles from './styles.css';

interface User {
    id: number;
    member: number;
    role: number;
    roleDisplay: string;
    joinedAt: string;

    memberDetails: {
        displayName: string;
        organizationTitle?: string;
    };
    roleDetails: {
        title: string;
    };
    addedByDetails?: {
        displayName: string;
    };
}

interface UserToEdit {
    id: number;
    member: number;
    memberName: string;
    role: number;
}

const userKeySelector = (user: User) => user.id;
const maxItemsPerPage = 10;

interface Props {
    className?: string;
    framework: Framework;
}

function UserTable(props: Props) {
    const {
        framework,
        className,
    } = props;

    const {
        user,
    } = useContext(UserContext);

    const activeUserId = user ? +user.id : undefined;

    const [activePage, setActivePage] = useState(1);

    const frameworkUsersQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

    const frameworkId = +framework.id;

    const {
        pending: frameworkUsersGetPending,
        response: frameworkUsers,
        retrigger: triggerMembersList,
    } = useRequest<MultiResponse<User>>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/memberships/`,
        query: frameworkUsersQuery,
        method: 'GET',
        preserveResponse: true,
        failureHeader: _ts('analyticalFramework', 'title'),
    });

    const [
        addUserModalShown,
        showUserAddModal,
        hideUserAddModal,
    ] = useModalState(false);

    const {
        pending: pendingDeleteAction,
        trigger: triggerUserRemove,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://framework-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerMembersList();
        },
        failureHeader: _ts('analyticalFramework.addUser', 'membershipPostFailed'),
    });

    const [userToEdit, setUserToEdit] = useState<UserToEdit | undefined>(undefined);

    const handleUserEditClick = useCallback((userId: number) => {
        const selectedUser = frameworkUsers?.results?.find((u) => u.id === userId);
        if (!selectedUser) {
            return;
        }
        setUserToEdit({
            id: selectedUser.id,
            member: selectedUser.member,
            memberName: selectedUser.memberDetails?.displayName,
            role: selectedUser.role,
        });
        showUserAddModal();
    }, [frameworkUsers?.results, showUserAddModal]);

    const handleUserAddClick = useCallback(() => {
        setUserToEdit(undefined);
        showUserAddModal();
    }, [showUserAddModal]);

    const columns = useMemo(
        () => {
            const actionColumn: TableColumn<
                User, number, ActionCellProps<number>, TableHeaderCellProps
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
                    onEditClick: handleUserEditClick,
                    onDeleteClick: triggerUserRemove,
                    disabled: data.member === activeUserId,
                    editButtonTitle: _ts('analyticalFramework', 'editUserLabel'),
                    deleteButtonTitle: _ts('analyticalFramework', 'deleteUserLabel'),
                    deleteConfirmationMessage: _ts('analyticalFramework', 'removeUserConfirmation'),
                }),
            };

            return ([
                createStringColumn<User, number>(
                    'name',
                    'Name',
                    (item) => item?.memberDetails?.displayName,
                ),
                createStringColumn<User, number>(
                    'organization',
                    'Organization',
                    (item) => item?.memberDetails?.organizationTitle,
                ),
                createStringColumn<User, number>(
                    'added_by',
                    'Added By',
                    (item) => item?.addedByDetails?.displayName,
                ),
                createDateColumn<User, number>(
                    'joined_at',
                    'Joined By',
                    (item) => item?.joinedAt,
                ),
                createStringColumn<User, number>(
                    'role',
                    'Assigned Role',
                    (item) => item?.roleDetails?.title,
                ),
                actionColumn,
            ]);
        },
        [handleUserEditClick, triggerUserRemove, activeUserId],
    );

    return (
        <>
            {(pendingDeleteAction || frameworkUsersGetPending) && <PendingMessage />}
            <Container
                className={_cs(styles.tableContainer, className)}
                heading={_ts('analyticalFramework', 'frameworkUsersHeading')}
                headerActions={(
                    <Button
                        name="userAdd"
                        onClick={handleUserAddClick}
                        icons={(<IoAdd />)}
                    >
                        {_ts('analyticalFramework', 'addUserButtonLabel')}
                    </Button>
                )}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={frameworkUsers?.count ?? 0}
                        maxItemsPerPage={maxItemsPerPage}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <TableView
                    data={frameworkUsers?.results}
                    keySelector={userKeySelector}
                    columns={columns}
                    rowClassName={styles.tableRow}
                />
            </Container>
            {addUserModalShown && (
                <AddUserModal
                    frameworkId={frameworkId}
                    onModalClose={hideUserAddModal}
                    onTableReload={triggerMembersList}
                    isPrivateFramework={framework.isPrivate}
                    userValue={userToEdit}
                />
            )}
        </>
    );
}

export default UserTable;
