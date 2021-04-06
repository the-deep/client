import React, { useCallback, useMemo } from 'react';
import RawTable from '#rscv/RawTable';
import { Header } from '#rscv/Table';
import TableHeader from '#rscv/TableHeader';
import FormattedDate from '#rscv/FormattedDate';
import Icon from '#rscg/Icon';
import {
    Container,
    Button,
} from '@the-deep/deep-ui';

import {
    Membership,
    ProjectRole,
} from '#typings';

import styles from './styles.scss';

interface Props{
    users: Membership[];
    pending: boolean;
    projectRoleList: ProjectRole[];
}

const userKeySelector = (d: Membership) => d.id;
function UserList(props: Props) {
    const {
        projectRoleList,
        pending,
        users,
    } = props;

    const getUserActiveRoleTitle = useCallback((member: Membership) => {
        const projectRole = projectRoleList.find(p => p.id === member.role);
        return projectRole?.title ?? '';
    }, [projectRoleList]);

    const headers: Header<Membership>[] = useMemo(() => ([
        {
            key: 'memberName',
            label: 'Name',
            order: 1,
            sortable: false,
        },
        {
            key: 'memberEmail',
            label: 'Email',
            order: 2,
            sortable: false,
        },
        {
            key: 'memberOrganization',
            label: 'Organization',
            order: 3,
            sortable: false,
        },
        {
            key: 'addedByName',
            label: 'Added by',
            order: 4,
        },
        {
            key: 'joinedAt',
            label: 'Added on',
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
            label: 'Assigned role',
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
            className={styles.users}
            contentClassName={styles.userList}
            heading="Project Users"
            headingClassName={styles.heading}
            headerActions={(
                <Button
                    className={styles.link}
                    variant="tertiary"
                    icons={(
                        <Icon
                            name="add"
                        />
                    )}
                >
                    Add a user
                </Button>
            )}
        >
            <RawTable
                data={users}
                dataModifier={dataModifier}
                headerModifier={headerModifier}
                headers={headers}
                keySelector={userKeySelector}
                className={styles.table}
                pending={pending}
            />
        </Container>
    );
}

export default UserList;
