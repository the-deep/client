import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    IoPencil,
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import {
    Container,
    Button,
    Pager,
    QuickActionButton,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';

import { notifyOnFailure } from '#utils/requestNotify';
import RawTable from '#rscv/RawTable';
import { Header } from '#rscv/Table';
import TableHeader from '#rscv/TableHeader';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Message from '#rscv/Message';
import FormattedDate from '#rscv/FormattedDate';
import { useRequest, useLazyRequest } from '#utils/request';
import _ts from '#ts';

import { useModalState } from '#hooks/stateManagement';
import {
    Membership,
    MultiResponse,
} from '#typings';

import AddUserModal from './AddUserModal';
import styles from './styles.scss';

interface Props{
    className?: string;
    projectId: number;
}

const maxItemsPerPage = 10;
const userKeySelector = (d: Membership) => d.id;

function UserList(props: Props) {
    const {
        projectId,
        className,
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

    const handleDeleteMembershipClick = triggerMembershipDelete;

    const handleEditMembershipClick = useCallback((membershipId) => {
        setMembershipIdToEdit(membershipId);
        setModalShow();
    }, [setModalShow]);

    const headers: Header<Membership>[] = useMemo(() => ([
        {
            key: 'memberName',
            label: _ts('projectEdit', 'memberName'),
            order: 1,
            sortable: false,
        },
        {
            key: 'memberEmail',
            label: _ts('projectEdit', 'memberEmail'),
            order: 2,
            sortable: false,
        },
        {
            key: 'memberOrganization',
            label: _ts('projectEdit', 'memberOrganization'),
            order: 3,
            sortable: false,
        },
        {
            key: 'addedByName',
            label: _ts('projectEdit', 'addedByName'),
            order: 4,
            sortable: false,
        },
        {
            key: 'joinedAt',
            label: _ts('projectEdit', 'addedOn'),
            order: 5,
            sortable: false,
            modifier: row => (
                <FormattedDate
                    value={row.joinedAt}
                    mode="dd MMM yyyy"
                />
            ),
        },
        {
            key: 'roleDetails',
            label: _ts('projectEdit', 'assignedRole'),
            order: 6,
            sortable: false,
            modifier: row => row.roleDetails.title,
        },
        {
            key: 'actions',
            label: _ts('projectEdit', 'actionsLabel'),
            order: 7,
            sortable: false,
            modifier: row => (
                <div className={styles.rowActions}>
                    <QuickActionButton
                        className={styles.button}
                        name={undefined}
                        title={_ts('projectEdit', 'editUserLabel')}
                        onClick={() => handleEditMembershipClick(row.id)}
                    >
                        <IoPencil />
                    </QuickActionButton>
                    <QuickActionConfirmButton
                        className={styles.button}
                        name={undefined}
                        title={_ts('projectEdit', 'deleteUserLabel')}
                        onClick={() => handleDeleteMembershipClick(row.id)}
                        message={_ts('projectEdit', 'removeUserConfirmation')}
                        showConfirmationInitially={false}
                    >
                        <IoTrash />
                    </QuickActionConfirmButton>
                </div>
            ),
        },
    ]), [handleDeleteMembershipClick, handleEditMembershipClick]);

    const dataModifier = useCallback(
        (data, columnKey) => {
            const header = headers.find(d => d.key === columnKey);
            if (header?.modifier) {
                return header.modifier(data);
            }
            return data[columnKey];
        }, [headers],
    );

    const headerModifier = useCallback(headerData => (
        <TableHeader
            label={headerData.label}
        />
    ), []);

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
            {usersPending && (<LoadingAnimation />)}
            {(usersResponse && usersResponse?.count > 0)
                ? (
                    <RawTable
                        className={styles.table}
                        data={usersResponse?.results ?? []}
                        dataModifier={dataModifier}
                        headerModifier={headerModifier}
                        headers={headers}
                        keySelector={userKeySelector}
                        pending={usersPending}
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

export default UserList;
