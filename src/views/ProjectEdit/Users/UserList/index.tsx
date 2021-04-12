import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    Button,
} from '@the-deep/deep-ui';

import RawTable from '#rscv/RawTable';
import { Header } from '#rscv/Table';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';
import Pager from '#rscv/Pager';
import useRequest from '#utils/request';
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
    const queryForRequest = useMemo(() => ({
        offset: (activePage - 1) * maxItemsPerPage,
        limit: maxItemsPerPage,
    }), [activePage]);
    const [
        showAddUserModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const [
        usersPending,
        usersResponse,
    ] = useRequest<MultiResponse<Membership>>({
        url: `server://projects/${projectId}/project-memberships/`,
        method: 'GET',
        query: queryForRequest,
        autoTrigger: true,
    });

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
    ]), []);

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

    const handleAddUserClick = useCallback(() => {
        setModalShow();
    }, [setModalShow]);

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
                        <Icon
                            name="add"
                        />
                    )}
                    onClick={handleAddUserClick}
                >
                    {_ts('projectEdit', 'addUser')}
                </Button>
            )}
        >
            <RawTable
                className={styles.table}
                data={usersResponse?.results ?? []}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                keySelector={userKeySelector}
                pending={usersPending}
            />
            {usersResponse && usersResponse.count > maxItemsPerPage && (
                <Pager
                    activePage={activePage}
                    itemsCount={usersResponse.count}
                    maxItemsPerPage={maxItemsPerPage}
                    onPageClick={setActivePage}
                    showItemsPerPageChange={false}
                />
            )}
            {showAddUserModal &&
                <AddUserModal
                    onModalClose={setModalHidden}
                    projectId={projectId}
                />
            }
        </Container>
    );
}

export default UserList;
