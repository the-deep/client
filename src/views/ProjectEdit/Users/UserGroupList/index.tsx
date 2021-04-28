import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    IoPencil,
    IoTrash,
    IoChevronForward,
    IoAdd,
} from 'react-icons/io5';

import {
    Container,
    Button,
    Link,
    QuickActionButton,
} from '@the-deep/deep-ui';

import { notifyOnFailure } from '#utils/requestNotify';
import RawTable from '#rscv/RawTable';
import { Header } from '#rscv/Table';
import TableHeader from '#rscv/TableHeader';
import Message from '#rscv/Message';
import LoadingAnimation from '#rscv/LoadingAnimation';
import FormattedDate from '#rscv/FormattedDate';
import Pager from '#rscv/Pager';
import useRequest from '#utils/request';
import _ts from '#ts';

import { useModalState } from '#hooks/stateManagement';

import {
    MultiResponse,
    UserGroup,
} from '#typings';

import AddUserGroupModal from './AddUserGroupModal';
import styles from './styles.scss';

interface Props{
    className?: string;
    projectId: number;
}

const maxItemsPerPage = 10;
const emptyLink = '#'; // TODO: Add link when made
const userGroupKeySelector = (d: UserGroup) => d.id;

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);
    const [usergroupIdToDelete, setUsergroupIdToDelete] = useState<number | undefined>(undefined);
    const [usergroupIdToEdit, setUsergroupIdToEdit] = useState<number | undefined>(undefined);
    const queryForRequest = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);

    const [
        showAddUserGroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const handleModalClose = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalHidden();
    }, [setModalHidden]);

    const [
        userGroupPending,
        userGroupResponse,
        ,
        triggerUsergroupResponse,
    ] = useRequest<MultiResponse<UserGroup>>({
        url: `server://projects/${projectId}/project-usergroups/`,
        method: 'GET',
        query: queryForRequest,
        autoTrigger: true,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupFetchFailed'))({ error: errorBody });
        },
    });

    const [
        ,
        ,
        ,
        triggerDeleteUsergroup,
    ] = useRequest({
        url: `server://projects/${projectId}/project-usergroups/${usergroupIdToDelete}/`,
        method: 'DELETE',
        onSuccess: () => {
            triggerUsergroupResponse();
        },
        autoTrigger: false,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupDeleteFailed'))({ error: errorBody });
        },
    });

    const handleDeleteUsergroupClick = useCallback((deleteUsergroupId) => {
        setUsergroupIdToDelete(deleteUsergroupId);
        triggerDeleteUsergroup();
    }, [triggerDeleteUsergroup]);

    const handleEditUsergroupClick = useCallback((usergroupId) => {
        setUsergroupIdToEdit(usergroupId);
        setModalShow();
    }, [setModalShow]);

    const headers: Header<UserGroup>[] = useMemo(() => ([
        {
            key: 'title',
            label: _ts('projectEdit', 'group'),
            order: 1,
            sortable: false,
        },
        {
            key: 'addedByName',
            label: _ts('projectEdit', 'addedByName'),
            order: 2,
            sortable: false,
        },
        {
            key: 'joinedAt',
            label: _ts('projectEdit', 'addedOn'),
            order: 3,
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
            label: _ts('projectEdit', 'groupRole'),
            order: 4,
            sortable: false,
            modifier: row => row.roleDetails.title,
        },
        {
            key: 'actions',
            label: _ts('projectEdit', 'actionsLabel'),
            order: 5,
            sortable: false,
            modifier: row => (
                <div className={styles.rowActions}>
                    <QuickActionButton
                        className={styles.button}
                        name={undefined}
                        title={_ts('projectEdit', 'editUsergroupLabel')}
                        onClick={() => handleEditUsergroupClick(row.id)}
                    >
                        <IoPencil />
                    </QuickActionButton>
                    <QuickActionButton
                        className={styles.button}
                        name={undefined}
                        title={_ts('projectEdit', 'deleteUsergroupLabel')}
                        onClick={() => handleDeleteUsergroupClick(row.id)}
                    >
                        <IoTrash />
                    </QuickActionButton>
                </div>
            ),
        },
    ]), [handleDeleteUsergroupClick, handleEditUsergroupClick]);

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

    const usergroupToEdit = useMemo(() => (
        userGroupResponse?.results?.find(d => d.id === usergroupIdToEdit)
    ), [userGroupResponse?.results, usergroupIdToEdit]);

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupIdToEdit(undefined);
        setModalShow();
    }, [setModalShow]);

    return (
        <Container
            className={_cs(className, styles.userGroups)}
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
            {userGroupPending && (<LoadingAnimation />)}
            {(userGroupResponse && userGroupResponse?.count > 0)
                ? (
                    <RawTable
                        className={styles.table}
                        data={userGroupResponse?.results ?? []}
                        dataModifier={dataModifier}
                        headerModifier={headerModifier}
                        headers={headers}
                        keySelector={userGroupKeySelector}
                        pending={userGroupPending && (userGroupResponse?.results ?? []).length < 1}
                    />
                )
                : (
                    <Message className={styles.emptyTable}>
                        {_ts('projectEdit', 'emptyUsergroupTableMessage')}
                    </Message>
                )
            }
            {userGroupResponse && userGroupResponse.count > maxItemsPerPage && (
                <Pager
                    activePage={activePage}
                    itemsCount={userGroupResponse.count}
                    maxItemsPerPage={maxItemsPerPage}
                    onPageClick={setActivePage}
                    showItemsPerPageChange={false}
                />
            )}
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
