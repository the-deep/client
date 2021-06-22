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
import ActionCell, { Props as ActionCellProps } from '#dui/EditDeleteActionCell';
import { useModalState } from '#hooks/stateManagement';
import _ts from '#ts';

import AddUsergroupModal from './AddUsergroupModal';
import styles from './styles.scss';

const mapStateToProps = (state: AppState) => ({
    activeUser: activeUserSelector(state),
});

interface Membership {
    id: number;
    member: number;
    memberName: string;
    memberEmail: string;
    role: string;
    group: number;
    joinedAt: string;
}

interface Usergroup {
    id: number;
    title: string;
    description: string;
    role: string;
    memberships: Membership[];
    globalCrisisMonitoring: boolean;
    createdAt: string;
    modifiedAt: string;
}

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
    const [
        showAddUSerGroupModal,
        setModalShow,
        setModalHidden,
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

    // FIXME: To be handled
    const handleEditUsergroupClick = useCallback(() => {}, []);

    // FIXME: To be handled
    const handleEditMemberClick = useCallback(() => {}, []);

    const columns = useMemo(() => {
        const actionColumn: TableColumn<
            Usergroup,
            number,
            ActionCellProps<number>,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('usergroup', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: passedUserId => ({
                itemKey: passedUserId,
                onEditClick: handleEditUsergroupClick,
                onDeleteClick: usergroupDeleteTrigger,
                editButtonTitle: _ts('usergroup', 'editUsergroupLabel'),
                deleteButtonTitle: _ts('usergroup', 'deleteUsergroupLabel'),
                deleteConfirmationMessage: _ts('usergroup', 'deleteUsergroupConfirmMessage'),
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
    }, [handleEditUsergroupClick, usergroupDeleteTrigger]);

    const membersColumns = useMemo(() => {
        const actionColumn: TableColumn<
            Membership,
            number,
            ActionCellProps<number>,
            TableHeaderCellProps
        > = {
            id: 'action',
            title: _ts('usergroup', 'actionLabel'),
            headerCellRenderer: TableHeaderCell,
            headerCellRendererParams: {
                sortable: false,
            },
            cellRenderer: ActionCell,
            cellRendererParams: passedUserId => ({
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
                    onClick={setModalShow}
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
            {showAddUSerGroupModal && (
                <AddUsergroupModal
                    onModalClose={setModalHidden}
                    onTableReload={usergroupResponseTrigger}
                />
            )}
        </Container>
    );
}

export default connect(mapStateToProps)(UserGroup);
