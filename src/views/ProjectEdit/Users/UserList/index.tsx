import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import { connect } from 'react-redux';
import { IoAdd } from 'react-icons/io5';
import {
    Container,
    Button,
    Pager,
    Table,
    PendingMessage,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#dui/tableHelpers';
import { notifyOnFailure } from '#utils/requestNotify';
import Message from '#rscv/Message';
import { useRequest, useLazyRequest } from '#utils/request';
import ActionCell, { Props as ActionCellProps } from '#dui/EditDeleteActionCell';
import _ts from '#ts';

import { activeUserSelector } from '#redux';
import { useModalState } from '#hooks/stateManagement';
import {
    Membership,
    MultiResponse,
    AppState,
} from '#typings';

import AddUserModal from './AddUserModal';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

const maxItemsPerPage = 10;
const userKeySelector = (d: Membership) => d.id;

interface PropsFromState {
    activeUser: { userId: number };
}

interface Props{
    className?: string;
    projectId: number;
}

function UserList(props: Props & PropsFromState) {
    const {
        projectId,
        className,
        activeUser,
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
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'userFetchFailed'))({ error: errorBody });
        },
    });

    const {
        trigger: triggerMembershipDelete,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://projects/${projectId}/project-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerGetUsers();
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'membershipDeleteFailed'))({ error: errorBody });
        },
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
                disabled: data.member === activeUser.userId,
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
    }, [triggerMembershipDelete, handleEditMembershipClick, activeUser.userId]);

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
                >
                    {_ts('projectEdit', 'addUser')}
                </Button>
            )}
        >
            {usersPending && (<PendingMessage />)}
            {(usersResponse && usersResponse?.count > 0)
                ? (
                    <Table
                        data={usersResponse.results}
                        keySelector={userKeySelector}
                        columns={columns}
                    />
                )
                : (
                    <div className={styles.emptyTable}>
                        <Message>
                            {_ts('projectEdit', 'emptyUserTableMessage')}
                        </Message>
                    </div>
                )
            }
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
                />
            }
        </Container>
    );
}

export default connect(mapStateToProps)(UserList);
