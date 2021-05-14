import React, { useState, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import {
    MdModeEdit,
} from 'react-icons/md';
import {
    Pager,
    Button,
    Header,
    PendingMessage,
    createStringColumn,
    Table,
    DateOutputProps,
    DateOutput,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    useRequest,
    useLazyRequest,
} from '#utils/request';
import { useModalState } from '#hooks/stateManagement';
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

interface ActionCellProps {
    className?: string;
    userId: number;
    onUserEditClick: (userId: number) => void;
    onUserRemoveClick: (userId: number) => void;
    disabled: boolean;
}

function ActionCell(props: ActionCellProps) {
    const {
        className,
        userId,
        onUserEditClick,
        onUserRemoveClick,
        disabled,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onUserEditClick(userId);
    }, [userId, onUserEditClick]);

    const handleDeleteMembershipClick = useCallback(() => {
        onUserRemoveClick(userId);
    }, [userId, onUserRemoveClick]);

    return (
        <div className={_cs(styles.actionCell, className)}>
            <QuickActionButton
                className={styles.button}
                name="editButton"
                onClick={handleEditButtonClick}
                disabled={disabled}
            >
                <MdModeEdit />
            </QuickActionButton>
            <QuickActionConfirmButton
                className={styles.button}
                name="deleteButton"
                title={_ts('projectEdit', 'deleteUserLabel')}
                onConfirm={handleDeleteMembershipClick}
                message={_ts('projectEdit', 'removeUserConfirmation')}
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrash />
            </QuickActionConfirmButton>
        </div>
    );
}

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

interface PropsFromState {
    activeUser: { userId: number };
}

interface Props {
    frameworkId: number;
}

interface User {
    id: number;
    member: number;
    role: number;
    roleDisplay: string;
    joinedAt: string;
    memberDetails: {
        displayName: string;
        organizationName: string;
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

function FrameworkDetails(props: Props & PropsFromState) {
    const {
        frameworkId,
        activeUser,
    } = props;

    const {
        pending: frameworkGetPending,
        response: analyticalFramework,
    } = useRequest<AnalyticalFramework>({
        skip: isNotDefined(frameworkId),
        url: `server://analysis-frameworks/${frameworkId}/`,
        method: 'GET',
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analyticalFramework', 'title'))({ error: errorBody }),
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
        onFailure: (_, errorBody) =>
            notifyOnFailure(_ts('analyticalFramework', 'title'))({ error: errorBody }),
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
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('analyticalFramework.addUser', 'membershipPostFailed'))({ error: errorBody });
        },
    });

    const [userToEdit, setUserToEdit] = useState<UserToEdit | undefined>(undefined);

    const handleUserEditClick = useCallback((userId: number) => {
        if (!frameworkUsers?.results) {
            return;
        }
        const selectedUser = frameworkUsers.results.find(u => u.id === userId);
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

    const columns = useMemo(
        () => {
            const actionColumn: TableColumn<User, number, ActionCellProps, TableHeaderCellProps> = {
                id: 'action',
                title: 'Actions',
                headerCellRenderer: TableHeaderCell,
                headerCellRendererParams: {
                    sortable: false,
                },
                cellRenderer: ActionCell,
                cellRendererParams: (userId, data) => ({
                    userId,
                    onUserEditClick: handleUserEditClick,
                    onUserRemoveClick: triggerUserRemove,
                    disabled: data.member === activeUser.userId,
                }),
            };

            const dateColumn: TableColumn<User, number, DateOutputProps, TableHeaderCellProps> = {
                id: 'joined_at',
                title: 'Joined At',
                headerCellRenderer: TableHeaderCell,
                headerCellRendererParams: {
                    sortable: false,
                },
                cellRenderer: DateOutput,
                cellRendererParams: (_, data) => ({
                    format: 'dd MMM, yyyy',
                    value: data.joinedAt,
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
                    item => item?.memberDetails?.organizationName,
                ),
                createStringColumn<User, number>(
                    'added_by',
                    'Added By',
                    item => item?.addedByDetails?.displayName,
                ),
                dateColumn,
                createStringColumn<User, number>(
                    'role',
                    'Assigned Role',
                    item => item?.roleDisplay,
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
                frameworkGetPending={frameworkGetPending}
            />
            <div className={styles.tableContainer}>
                {(pendingDeleteAction || frameworkUsersGetPending) && <PendingMessage />}
                <Header
                    heading={_ts('analyticalFramework', 'frameworkUsersHeading')}
                    actions={(
                        <Button
                            name="userAdd"
                            onClick={showUserAddModal}
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
        </div>
    );
}

export default connect(mapStateToProps)(FrameworkDetails);
