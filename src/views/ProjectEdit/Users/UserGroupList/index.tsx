import React, { useCallback, useMemo, useState } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Container,
    Button,
    Link,
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
    MultiResponse,
    UserGroup,
} from '#typings';

import AddUserGroupModal from './AddUserGroupModal';
import styles from './styles.scss';

interface Props{
    className?: string;
    projectId: string;
    onModalClose?: () => void;
}

const maxItemsPerPage = 10;
const emptyLink = '#'; // TODO: Add link when made
const userGroupKeySelector = (d: UserGroup) => d.id;

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
        onModalClose,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);

    const [
        showAddUserGroupModal,
        setModalShow,
        setModalHidden,
    ] = useModalState(false);

    const [
        userGroupPending,
        userGroupResponse,
    ] = useRequest<MultiResponse<UserGroup>>({
        url: `server://projects/${projectId}/project-usergroups/`,
        method: 'GET',
        query: {
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        autoTrigger: true,
    });

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

    const handleAddUsergroupClick = useCallback(() => {
        setModalShow();
    }, []);

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
                            <Icon
                                name="chevronRight"
                            />
                        )}
                    >
                        {_ts('projectEdit', 'manageUserGroup')}
                    </Link>
                </>
            )}
            headingClassName={styles.heading}
            headerClassName={styles.header}
            headerActions={(
                <div className={styles.actions}>
                    <Button
                        variant="tertiary"
                        icons={(
                            <Icon
                                name="add"
                            />
                        )}
                        onClick={handleAddUsergroupClick}
                    >
                        {_ts('projectEdit', 'addUserGroup')}
                    </Button>
                </div>
            )}
        >
            <RawTable
                data={userGroupResponse?.results ?? []}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                keySelector={userGroupKeySelector}
                pending={userGroupPending && (userGroupResponse?.results ?? []).length < 1}
            />
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
                    onModalClose={setModalHidden}
                    usergroupList={userGroupResponse?.results ?? []}
                />
            )}
        </Container>
    );
}

export default UserGroupList;
