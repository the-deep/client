import React, { useCallback, useMemo, useState } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import { generatePath } from 'react-router-dom';
import {
    IoChevronForward,
    IoAdd,
} from 'react-icons/io5';
import {
    Container,
    Button,
    Link,
    Kraken,
    Pager,
    TableView,
    TableColumn,
    TableHeaderCell,
    TableHeaderCellProps,
    createStringColumn,
    PendingMessage,
} from '@the-deep/deep-ui';

import { createDateColumn } from '#components/tableHelpers';
import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import routes from '#base/configs/routes';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import { useModalState } from '#hooks/stateManagement';

import {
    MultiResponse,
    UserGroup,
} from '#types';
import _ts from '#ts';

import AddUserGroupModal from './AddUserGroupModal';

import styles from './styles.css';

const maxItemsPerPage = 10;
const usergroupKeySelector = (d: UserGroup) => d.id;

interface Props{
    className?: string;
    projectId: string;
    activeUserRoleLevel?: number;
    pending?: boolean;
}

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
        activeUserRoleLevel,
        pending,
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
        failureHeader: _ts('projectEdit', 'usergroupFetchFailed'),
    });

    const {
        trigger: triggerDeleteUsergroup,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://projects/${projectId}/project-usergroups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerUsergroupResponse();
        },
        failureHeader: _ts('projectEdit', 'usergroupDeleteFailed'),
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
            cellRendererParams: (userId, data) => ({
                itemKey: userId,
                onEditClick: handleEditUsergroupClick,
                onDeleteClick: triggerDeleteUsergroup,
                disabled: (
                    isNotDefined(activeUserRoleLevel)
                    || data.roleDetails.level < activeUserRoleLevel
                ),
                editButtonTitle: _ts('projectEdit', 'editUsergroupLabel'),
                deleteButtonTitle: _ts('projectEdit', 'deleteUserLabel'),
                deleteConfirmationMessage: _ts('projectEdit', 'removeUserGroupConfirmation'),
            }),
        };

        return ([
            createStringColumn<UserGroup, number>(
                'title',
                _ts('projectEdit', 'group'),
                (item) => item.title,
            ),
            createStringColumn<UserGroup, number>(
                'addedByName',
                _ts('projectEdit', 'addedByName'),
                (item) => item.addedByName,
            ),
            createDateColumn<UserGroup, number>(
                'joinedAt',
                _ts('projectEdit', 'addedOn'),
                (item) => item.joinedAt,
            ),
            createStringColumn<UserGroup, number>(
                'role',
                'Assigned Role',
                (item) => item?.roleDetails.title,
            ),
            actionColumn,
        ]);
    }, [triggerDeleteUsergroup, handleEditUsergroupClick, activeUserRoleLevel]);

    const usergroupToEdit = useMemo(() => (
        usergroupResponse?.results?.find((d) => d.id === usergroupIdToEdit)
    ), [usergroupResponse?.results, usergroupIdToEdit]);

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    const routeToUserGroups = generatePath(
        routes.userGroups.path,
        {},
    );

    return (
        <Container
            className={_cs(className, styles.usergroups)}
            heading={_ts('projectEdit', 'userGroup')}
            inlineHeadingDescription
            headingDescription={(
                <Link
                    className={styles.userGroupsLink}
                    to={routeToUserGroups}
                    actions={(
                        <IoChevronForward />
                    )}
                >
                    {_ts('projectEdit', 'manageUserGroup')}
                </Link>
            )}
            contentClassName={styles.content}
            headerActions={(
                <Button
                    variant="tertiary"
                    name="add-usergroup"
                    icons={(
                        <IoAdd />
                    )}
                    onClick={handleAddUsergroupClick}
                    disabled={pending}
                >
                    {_ts('projectEdit', 'addUserGroup')}
                </Button>
            )}
        >
            {(usergroupPending || pending) && (<PendingMessage />)}
            <TableView
                data={usergroupResponse?.results}
                keySelector={usergroupKeySelector}
                columns={columns}
                emptyMessage={_ts('projectEdit', 'emptyUsergroupTableMessage')}
                rowClassName={styles.tableRow}
                filtered={false}
                pending={usergroupPending}
                emptyIcon={(
                    <Kraken
                        variant="standby"
                    />
                )}
                messageShown
                messageIconShown
            />
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
                    activeUserRoleLevel={activeUserRoleLevel}
                />
            )}
        </Container>
    );
}

export default UserGroupList;
