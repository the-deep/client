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

import {
    Membership,
    ProjectRole,
    MultiResponse,
    UserGroup,
} from '#typings';

import styles from './styles.scss';

interface Props{
    className?: string;
    users: Membership[];
    projectId: string;
    projectRoleList: ProjectRole[];
}

const maxItemsPerPage = 10;
const emptyLink = '#'; // TODO: Add link when made
const userGroupKeySelector = (d: UserGroup) => d.id;

function UserGroupList(props: Props) {
    const {
        className,
        projectId,
        projectRoleList,
        users,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);

    const [
        userGroupPending,
        userGroupResponse,
    ] = useRequest<MultiResponse<UserGroup>>({
        url: 'server://project-usergroups/',
        method: 'GET',
        query: {
            project: projectId,
        },
        autoTrigger: true,
    });

    const getUserGroupActiveRoleTitle = useCallback((group: UserGroup) => {
        const projectRole = projectRoleList.find(p => p.id === group.role);
        return projectRole?.title ?? '';
    }, [projectRoleList]);

    const getAddedByUserName = useCallback((group: UserGroup) => {
        const user = users.find(u => u.member === group.addedBy);
        return user?.memberName ?? '';
    }, [users]);
    const headers: Header<UserGroup>[] = useMemo(() => ([
        {
            key: 'title',
            label: 'Group',
            order: 1,
            sortable: false,
        },
        {
            key: 'addedBy',
            label: 'Added by',
            order: 2,
            sortable: false,
            modifier: row => getAddedByUserName(row),
        },
        {
            key: 'joinedAt',
            label: 'Added on',
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
            key: 'role',
            label: 'Assigned group role',
            order: 4,
            sortable: false,
            modifier: row => getUserGroupActiveRoleTitle(row),
        },
    ]), [getAddedByUserName, getUserGroupActiveRoleTitle]);

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

    return (
        <Container
            className={_cs(className, styles.userGroups)}
            heading={(
                <>
                    <span className={styles.title}>
                        User Groups
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
                        Manage My User Groups
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
                    >
                        Add a user group
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
        </Container>
    );
}

export default UserGroupList;
