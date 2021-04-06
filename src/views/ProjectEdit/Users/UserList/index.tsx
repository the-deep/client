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

import {
    Membership,
    MultiResponse,
    ProjectRole,
} from '#typings';

import styles from './styles.scss';

interface Props{
    className?: string;
    projectId: string;
    projectRoleList: ProjectRole[];
}

const maxItemsPerPage = 10;
const userKeySelector = (d: Membership) => d.id;

function UserList(props: Props) {
    const {
        projectRoleList,
        projectId,
        className,
    } = props;

    const [activePage, setActivePage] = useState<number>(1);

    const [
        usersPending,
        usersResponse,
    ] = useRequest<MultiResponse<Membership>>({
        url: 'server://project-memberships/',
        method: 'GET',
        query: {
            project: projectId,
            offset: (activePage - 1) * maxItemsPerPage,
            limit: maxItemsPerPage,
        },
        autoTrigger: true,
    });

    const getUserActiveRoleTitle = useCallback((member: Membership) => {
        const projectRole = projectRoleList.find(p => p.id === member.role);
        return projectRole?.title ?? '';
    }, [projectRoleList]);

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
            key: 'role',
            label: _ts('projectEdit', 'assignedRole'),
            order: 6,
            sortable: false,
            modifier: row => getUserActiveRoleTitle(row),
        },
    ]), [getUserActiveRoleTitle]);

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
            className={_cs(className, styles.users)}
            heading={_ts('projectEdit', 'projectUsers')}
            headingClassName={styles.heading}
            headerActions={(
                <Button
                    variant="tertiary"
                    icons={(
                        <Icon
                            name="add"
                        />
                    )}
                >
                    {_ts('projectEdit', 'addUser')}
                </Button>
            )}
        >
            <RawTable
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
        </Container>
    );
}

export default UserList;
