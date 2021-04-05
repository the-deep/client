import React, { useCallback, useMemo } from 'react';
import RawTable from '#rscv/RawTable';
import { Header } from '#rscv/Table';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import {
    Container,
} from '@the-deep/deep-ui';
import useRequest from '#utils/request';

import {
    Membership,
    ProjectRole,
    MultiResponse,
    UserGroup,
} from '#typings';

import styles from './styles.scss';

interface Props{
    users: Membership[];
    projectId: string;
    projectRoleList: ProjectRole[];
}

const userGroupKeySelector = (d: UserGroup) => d.id;

function UserGroupList(props: Props) {
    const {
        projectId,
        projectRoleList,
        users,
    } = props;

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
            className={styles.userGroups}
            contentClassName={styles.userGroupList}
            heading="User Groups"
            headingClassName={styles.header}
        >
            <RawTable
                data={userGroupResponse?.results ?? []}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                keySelector={userGroupKeySelector}
                className={styles.table}
                pending={userGroupPending && (userGroupResponse?.results ?? []).length < 1}
            />
        </Container>
    );
}

export default UserGroupList;
