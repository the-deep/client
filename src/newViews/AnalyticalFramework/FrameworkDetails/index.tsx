import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { isNotDefined } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Pager,
    Button,
    Header,
    PendingMessage,
    createStringColumn,
    Table,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
} from '@the-deep/deep-ui';
import { createDateColumn } from '#newComponents/ui/tableHelpers';
import {
    useRequest,
    useLazyRequest,
} from '#utils/request';
import { useModalState } from '#hooks/stateManagement';
import ActionCell, { Props as ActionCellProps } from '#newComponents/ui/EditDeleteActionCell';
import {
    AppState,
    AnalyticalFramework,
    MultiResponse,
} from '#typings';
import _ts from '#ts';
import { activeUserSelector } from '#redux';

import FrameworkDetailsForm from './FrameworkDetailsForm';
import AddUserModal from '../AddUserModal';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

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

interface PropsFromState {
    activeUser: { userId: number };
}

interface Props {
    frameworkId: number;
}

function FrameworkDetails(props: Props & PropsFromState) {
    const {
        frameworkId,
        activeUser,
    } = props;

    const [
        analyticalFramework,
        setFramework,
    ] = useState<AnalyticalFramework | undefined>(undefined);

    const {
        pending: frameworkGetPending,
    } = useRequest<AnalyticalFramework>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/`,
        method: 'GET',
        failureHeader: _ts('analyticalFramework', 'title'),
        onSuccess: (response) => {
            setFramework(response);
        },
        onFailure: () => {
            setFramework(undefined);
        },
    });

    const [activePage, setActivePage] = useState(1);

    const frameworkUsersQuery = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

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
        url: ctx => `server://framework-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerMembersList();
        },
        failureHeader: _ts('analyticalFramework.addUser', 'membershipPostFailed'),
    });

    const [userToEdit, setUserToEdit] = useState<UserToEdit | undefined>(undefined);

    const handleUserEditClick = useCallback((userId: number) => {
        const selectedUser = frameworkUsers?.results?.find(u => u.id === userId);
        if (!selectedUser) {
            return;
        }
        setUserToEdit({
            id: selectedUser.id,
            member: selectedUser.member,
            memberName: selectedUser?.memberDetails?.displayName,
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
                    disabled: data.member === activeUser.userId,
                    editButtonTitle: _ts('analyticalFramework', 'editUserLabel'),
                    deleteButtonTitle: _ts('analyticalFramework', 'deleteUserLabel'),
                    deleteConfirmationMessage: _ts('analyticalFramework', 'removeUserConfirmation'),
                }),
            };

            return ([
                createStringColumn<User, number>(
                    'name',
                    'Name',
                    item => item?.memberDetails?.displayName,
                ),
                createStringColumn<User, number>(
                    'organization',
                    'Organization',
                    item => item?.memberDetails?.organizationTitle,
                ),
                createStringColumn<User, number>(
                    'added_by',
                    'Added By',
                    item => item?.addedByDetails?.displayName,
                ),
                createDateColumn<User, number>(
                    'joined_at',
                    'Joined By',
                    item => item?.joinedAt,
                ),
                createStringColumn<User, number>(
                    'role',
                    'Assigned Role',
                    item => item?.roleDetails?.title,
                ),
                actionColumn,
            ]);
        },
        [handleUserEditClick, triggerUserRemove, activeUser.userId],
    );

    return (
        <div className={styles.frameworkDetails}>
            <FrameworkDetailsForm
                className={styles.frameworkForm}
                frameworkId={frameworkId}
                key={analyticalFramework?.title}
                analyticalFramework={analyticalFramework}
                onSuccess={setFramework}
                frameworkGetPending={frameworkGetPending}
            />
            {frameworkId && (
                <>
                    <div className={styles.tableContainer}>
                        {(pendingDeleteAction || frameworkUsersGetPending) && <PendingMessage />}
                        <Header
                            heading={_ts('analyticalFramework', 'frameworkUsersHeading')}
                            actions={(
                                <Button
                                    name="userAdd"
                                    onClick={handleUserAddClick}
                                    icons={(<IoAdd />)}
                                >
                                    {_ts('analyticalFramework', 'addUserButtonLabel')}
                                </Button>
                            )}
                        />
                        <Table
                            data={frameworkUsers?.results}
                            keySelector={userKeySelector}
                            columns={columns}
                        />
                        <div className={styles.pagerContainer}>
                            <Pager
                                activePage={activePage}
                                itemsCount={frameworkUsers?.count ?? 0}
                                maxItemsPerPage={maxItemsPerPage}
                                onActivePageChange={setActivePage}
                                itemsPerPageControlHidden
                            />
                        </div>
                    </div>
                    {analyticalFramework && addUserModalShown && (
                        <AddUserModal
                            frameworkId={frameworkId}
                            onModalClose={hideUserAddModal}
                            onTableReload={triggerMembersList}
                            isPrivateFramework={analyticalFramework?.isPrivate}
                            userValue={userToEdit}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default connect(mapStateToProps)(FrameworkDetails);
