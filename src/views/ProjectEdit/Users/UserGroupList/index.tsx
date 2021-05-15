import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoTrash,
    IoChevronForward,
    IoAdd,
} from 'react-icons/io5';
import { MdModeEdit } from 'react-icons/md';
import {
    Container,
    Button,
    Link,
    Pager,
    QuickActionButton,
    QuickActionConfirmButton,
    Table,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    PendingMessage,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#dui/tableHelpers';
import { notifyOnFailure } from '#utils/requestNotify';
import Message from '#rscv/Message';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';

import { useModalState } from '#hooks/stateManagement';

import {
    MultiResponse,
    UserGroup,
} from '#typings';

import AddUserGroupModal from './AddUserGroupModal';
import styles from './styles.scss';

interface ActionCellProps<T> {
    className?: string;
    itemKey: T;
    onEditClick: (key: T) => void;
    onDeleteClick: (key: T) => void;
    disabled?: boolean;
}

function ActionCell<T>(props: ActionCellProps<T>) {
    const {
        className,
        itemKey,
        onEditClick,
        onDeleteClick,
        disabled,
    } = props;

    const handleEditButtonClick = useCallback(() => {
        onEditClick(itemKey);
    }, [itemKey, onEditClick]);

    const handleDeleteUserGroupClick = useCallback(() => {
        onDeleteClick(itemKey);
    }, [itemKey, onDeleteClick]);

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
                onConfirm={handleDeleteUserGroupClick}
                message={_ts('projectEdit', 'removeUserGroupConfirmation')}
                showConfirmationInitially={false}
                disabled={disabled}
            >
                <IoTrash />
            </QuickActionConfirmButton>
        </div>
    );
}

const maxItemsPerPage = 10;
const emptyLink = '#'; // TODO: Add link when made
const usergroupKeySelector = (d: UserGroup) => d.id;

interface Props{
    className?: string;
    projectId: number;
}

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [usergroupIdToEdit, setUsergroupIdToEdit] = useState<number | undefined>(undefined);

    const [
        showAddUserGroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalHidden();
    }, [setModalHidden]);

    const queryForRequest = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

    const {
        pending: usergroupPending,
        response: usergroupResponse,
        retrigger: triggerUsergroupResponse,
    } = useRequest<MultiResponse<UserGroup>>({
        url: `server://projects/${projectId}/project-usergroups/`,
        method: 'GET',
        query: queryForRequest,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupFetchFailed'))({ error: errorBody });
        },
    });

    const {
        trigger: triggerDeleteUsergroup,
    } = useLazyRequest<unknown, number>({
        url: ctx => `server://projects/${projectId}/project-usergroups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerUsergroupResponse();
        },
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupDeleteFailed'))({ error: errorBody });
        },
    });

    const handleEditUsergroupClick = useCallback((usergroupId) => {
        setUsergroupIdToEdit(usergroupId);
        setModalShow();
    }, [setModalShow]);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            UserGroup, number, ActionCellProps<number>, TableHeaderCellProps
        > = {
            id: 'action',
            title: 'Actions',
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: userId => ({
                itemKey: userId,
                onEditClick: handleEditUsergroupClick,
                onDeleteClick: triggerDeleteUsergroup,
            }),
        };

        return ([
            createStringColumn<UserGroup, number>(
                'title',
                _ts('projectEdit', 'group'),
                item => item.title,
            ),
            createStringColumn<UserGroup, number>(
                'addedByName',
                _ts('projectEdit', 'addedByName'),
                item => item.addedByName,
            ),
            createDateColumn<UserGroup, number>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                item => item.joinedAt,
            ),
            createStringColumn<UserGroup, number>(
                'role',
                'Assigned Role',
                item => item?.roleDetails.title,
            ),
            actionColumn,
        ]);
    }, [triggerDeleteUsergroup, handleEditUsergroupClick]);

    const usergroupToEdit = useMemo(() => (
        usergroupResponse?.results?.find(d => d.id === usergroupIdToEdit)
    ), [usergroupResponse?.results, usergroupIdToEdit]);

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    return (
        <Container
            className={_cs(className, styles.usergroups)}
            heading={(
                <>
                    <span className={styles.title}>
                        {_ts('projectEdit', 'userGroup')}
                    </span>
                    <Link
                        className={styles.link}
                        to={emptyLink}
                        actions={(
                            <IoChevronForward />
                        )}
                    >
                        {_ts('projectEdit', 'manageUserGroup')}
                    </Link>
                </>
            )}
            headingClassName={styles.heading}
            headerClassName={styles.header}
            contentClassName={styles.content}
            headerActions={(
                <div className={styles.actions}>
                    <Button
                        variant="tertiary"
                        name="add-usergroup"
                        icons={(
                            <IoAdd />
                        )}
                        onClick={handleAddUsergroupClick}
                    >
                        {_ts('projectEdit', 'addUserGroup')}
                    </Button>
                </div>
            )}
        >
            {usergroupPending && (<PendingMessage />)}
            {(usergroupResponse && usergroupResponse?.count > 0)
                ? (
                    <Table
                        className={styles.table}
                        data={usergroupResponse.results}
                        keySelector={usergroupKeySelector}
                        columns={columns}
                    />
                ) : (
                    <div className={styles.emptyTable}>
                        <Message>
                            {_ts('projectEdit', 'emptyUsergroupTableMessage')}
                        </Message>
                    </div>
                )
            }
            <Pager
                activePage={activePage}
                className={styles.pager}
                itemsCount={usergroupResponse?.count ?? 0}
                maxItemsPerPage={maxItemsPerPage}
                onActivePageChange={setActivePage}
                itemsPerPageControlHidden
            />
            {showAddUserGroupModal && (
                <AddUserGroupModal
                    onModalClose={handleModalClose}
                    projectId={projectId}
                    onTableReload={triggerUsergroupResponse}
                    usergroupValue={usergroupToEdit}
                />
            )}
        </Container>
    );
}

export default UserGroupList;
