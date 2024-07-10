import React, { useContext, useState, useCallback, useMemo } from 'react';
import { _cs, isNotDefined } from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';
import {
    Pager,
    Button,
    Container,
    PendingMessage,
    createStringColumn,
    TableView,
    TableColumn,
    useAlert,
    TableHeaderCell,
    TableHeaderCellProps,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import { createDateColumn } from '#components/tableHelpers';
import { AnalysisFrameworkMembersQuery } from '#generated/types';
import {
    useLazyRequest,
} from '#base/utils/restRequest';
import { useModalState } from '#hooks/stateManagement';
import ActionCell, { Props as ActionCellProps } from '#components/tableHelpers/EditDeleteActionCell';
import _ts from '#ts';
import UserContext from '#base/context/UserContext';

import { Framework } from '../types';

import AddUserModal from './AddUserModal';
import styles from './styles.css';

const ANALYSIS_FRAMEWORK_MEMBERS = gql`
    query AnalysisFrameworkMembers($frameworkId: ID!) {
        analysisFramework(id: $frameworkId) {
            members {
                addedBy {
                    displayName
                }
                id
                joinedAt
                member {
                    displayName
                    profile {
                        organization
                    }
                }
                role {
                    title
                    id
                }
            }
        }
    }
`;

type AnalysisFrameworkMember = NonNullable<NonNullable<AnalysisFrameworkMembersQuery['analysisFramework']>['members']>[number];

const userKeySelector = (user: AnalysisFrameworkMember) => user.id;
const maxItemsPerPage = 10;

interface Props {
    className?: string;
    framework: Framework;
}

function UserTable(props: Props) {
    const {
        framework,
        className,
    } = props;

    const {
        user,
    } = useContext(UserContext);
    const alert = useAlert();

    const activeUserId = user ? user.id : undefined;

    const [activePage, setActivePage] = useState(1);

    const frameworkId = framework.id;

    const {
        data: analysisFrameworkMembersResponse,
        loading: analysisFrameworkMembersLoading,
        refetch: analysisFrameworkMembersTrigger,
    } = useQuery<AnalysisFrameworkMembersQuery>(
        ANALYSIS_FRAMEWORK_MEMBERS,
        {
            variables: {
                frameworkId,
            },
        },
    );

    const [
        addUserModalShown,
        showUserAddModal,
        hideUserAddModal,
    ] = useModalState(false);

    const {
        pending: pendingDeleteAction,
        trigger: triggerUserRemove,
    } = useLazyRequest<unknown, string>({
        url: (ctx) => `server://framework-memberships/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            alert.show(
                'Successfully removed user from the analytical framework.',
                {
                    variant: 'success',
                },
            );
            analysisFrameworkMembersTrigger();
        },
        failureMessage: 'Failed to remove user from the analytical framework.',
    });

    const [userToEdit, setUserToEdit] = useState<AnalysisFrameworkMember | undefined>(undefined);

    const handleUserEditClick = useCallback((userId: string) => {
        if (isNotDefined(analysisFrameworkMembersResponse?.analysisFramework?.members)) {
            return;
        }
        const selectedUser = analysisFrameworkMembersResponse
            ?.analysisFramework?.members.find((u) => u.id === userId);

        if (!selectedUser) {
            return;
        }
        setUserToEdit(selectedUser);
        showUserAddModal();
    }, [analysisFrameworkMembersResponse, showUserAddModal]);

    const handleUserAddClick = useCallback(() => {
        setUserToEdit(undefined);
        showUserAddModal();
    }, [showUserAddModal]);

    const columns = useMemo(
        () => {
            const actionColumn: TableColumn<
                AnalysisFrameworkMember,
                string,
                ActionCellProps<string>,
                TableHeaderCellProps
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
                    onEditClick: handleUserEditClick,
                    onDeleteClick: triggerUserRemove,
                    disabled: data.id === activeUserId,
                    editButtonTitle: _ts('analyticalFramework', 'editUserLabel'),
                    deleteButtonTitle: _ts('analyticalFramework', 'deleteUserLabel'),
                    deleteConfirmationMessage: _ts('analyticalFramework', 'removeUserConfirmation'),
                }),
            };

            return ([
                createStringColumn<AnalysisFrameworkMember, string>(
                    'name',
                    'Name',
                    (item) => item?.member?.displayName,
                ),
                createStringColumn<AnalysisFrameworkMember, string>(
                    'organization',
                    'Organization',
                    (item) => item?.member?.profile.organization,
                ),
                createStringColumn<AnalysisFrameworkMember, string>(
                    'added_by',
                    'Added By',
                    (item) => item?.addedBy?.displayName,
                ),
                createDateColumn<AnalysisFrameworkMember, string>(
                    'joined_at',
                    'Joined By',
                    (item) => item?.joinedAt,
                ),
                createStringColumn<AnalysisFrameworkMember, string>(
                    'role',
                    'Assigned Role',
                    (item) => item?.role?.title,
                ),
                actionColumn,
            ]);
        },
        [handleUserEditClick, triggerUserRemove, activeUserId],
    );

    return (
        <>
            {pendingDeleteAction && <PendingMessage />}
            <Container
                className={_cs(styles.tableContainer, className)}
                heading={_ts('analyticalFramework', 'frameworkUsersHeading')}
                headerActions={(
                    <Button
                        name="userAdd"
                        onClick={handleUserAddClick}
                        icons={(<IoAdd />)}
                    >
                        {_ts('analyticalFramework', 'addUserButtonLabel')}
                    </Button>
                )}
                footerActions={(
                    <Pager
                        activePage={activePage}
                        itemsCount={
                            analysisFrameworkMembersResponse?.analysisFramework?.members?.length
                                ?? 0
                        }
                        maxItemsPerPage={maxItemsPerPage}
                        onActivePageChange={setActivePage}
                        itemsPerPageControlHidden
                    />
                )}
            >
                <TableView
                    data={analysisFrameworkMembersResponse?.analysisFramework?.members}
                    keySelector={userKeySelector}
                    columns={columns}
                    rowClassName={styles.tableRow}
                    pending={analysisFrameworkMembersLoading}
                    errored={false}
                    filtered={false}
                    emptyMessage="No users found"
                    messageShown
                />
            </Container>
            {addUserModalShown && (
                <AddUserModal
                    frameworkId={frameworkId}
                    onModalClose={hideUserAddModal}
                    onTableReload={analysisFrameworkMembersTrigger}
                    isPrivateFramework={framework.isPrivate}
                    userValue={userToEdit}
                />
            )}
        </>
    );
}

export default UserTable;
