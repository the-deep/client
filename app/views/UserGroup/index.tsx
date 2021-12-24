import React, { useContext, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    Pager,
    ListView,
    Kraken,
    useAlert,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';
import { MultiResponse } from '#types';
import { useModalState } from '#hooks/stateManagement';
import UserContext from '#base/context/UserContext';
import _ts from '#ts';

import AddUserGroupModal, { UserGroup as UserGroupType } from './AddUsergroupModal';
import UserGroupItem from './UserGroupItem';

import styles from './styles.css';

const MAX_ITEMS_PER_PAGE = 10;
const usergroupKeySelector = (d: UserGroupType) => d.id;

interface Props {
    className?: string;
}

function UserGroup(props: Props) {
    const {
        className,
    } = props;

    const {
        user,
    } = useContext(UserContext);
    const alert = useAlert();

    const userId = user ? user?.id : undefined;

    const [activePage, setActivePage] = useState<number>(1);
    const [expandedUserGroupId, setExpandedUserGroupId] = useState<string>();

    const [userGroupToEdit, setUserGroupToEdit] = useState<string>();

    const [
        showAddUserGroupModal,
        setUserGroupModalShow,
        setUserGroupModalHidden,
    ] = useModalState(false);

    const usergroupQuery = useMemo(() => ({
        user: user?.id,
        offset: (activePage - 1) * MAX_ITEMS_PER_PAGE,
        limit: MAX_ITEMS_PER_PAGE,
        fields: [
            'id',
            'title',
            'members_count',
            'role',
            'created_at',
        ],
    }), [user?.id, activePage]);

    const {
        pending: usergroupGetPending,
        response: usergroupResponse,
        retrigger: usergroupGetRetrigger,
    } = useRequest<MultiResponse<UserGroupType>>({
        url: 'server://user-groups/member-of/',
        method: 'GET',
        query: usergroupQuery,
        preserveResponse: true,
    });

    const {
        trigger: usergroupDeleteTrigger,
    } = useLazyRequest<unknown, string>({
        url: (ctx) => `server://user-groups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usergroupGetRetrigger();
            alert.show(
                'Successfully deleted user group.',
                { variant: 'success' },
            );
        },
        onFailure: () => {
            alert.show(
                'Failed to delete user group.',
                { variant: 'error' },
            );
        },
    });

    const usergroupObjectToEdit = useMemo(() => (
        usergroupResponse?.results?.find((a) => a.id === userGroupToEdit)
    ), [usergroupResponse?.results, userGroupToEdit]);

    const handleAddUserGroupClick = useCallback(() => {
        setUserGroupToEdit(undefined);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const handleEditUserGroupClick = useCallback((value) => {
        setUserGroupToEdit(value);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const [autoFocusUserGroup, setAutoFocusUserGroup] = useState<string>();

    const handleEditUserGroupSuccess = useCallback((newItemId: string) => {
        setAutoFocusUserGroup(newItemId);
        usergroupGetRetrigger();
        setUserGroupModalHidden();
    }, [setUserGroupModalHidden, usergroupGetRetrigger]);

    const handleExpansionChange = useCallback((usergroupExpanded: boolean, usergroupId: string) => {
        setExpandedUserGroupId(usergroupExpanded ? usergroupId : undefined);
    }, []);

    const userGroupRendererParams = useCallback((key: string, datum: UserGroupType) => ({
        activeUserGroupId: expandedUserGroupId,
        userGroupId: key,
        activeUserId: userId,
        onUserDeleteSuccess: usergroupGetRetrigger,
        onDeleteClick: usergroupDeleteTrigger,
        onEditClick: handleEditUserGroupClick,
        userGroup: datum,
        onExpansionChange: handleExpansionChange,
        autoFocus: autoFocusUserGroup === datum.id,
        expanded: expandedUserGroupId === datum.id,
    }), [
        autoFocusUserGroup,
        userId,
        usergroupGetRetrigger,
        usergroupDeleteTrigger,
        handleEditUserGroupClick,
        handleExpansionChange,
        expandedUserGroupId,
    ]);

    return (
        <Container
            className={_cs(styles.userGroup, className)}
            heading={_ts('usergroup', 'usergroupPageTitle')}
            headerActions={(
                <Button
                    name="addUserGroup"
                    icons={<IoAdd />}
                    onClick={handleAddUserGroupClick}
                >
                    {_ts('usergroup', 'addUsergroupButtonLabel')}
                </Button>
            )}
            footerActions={(
                <Pager
                    activePage={activePage}
                    itemsCount={usergroupResponse?.count ?? 0}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={MAX_ITEMS_PER_PAGE}
                    itemsPerPageControlHidden
                />
            )}
            contentClassName={styles.content}
        >
            <ListView
                className={styles.userGroupList}
                keySelector={usergroupKeySelector}
                data={usergroupResponse?.results}
                renderer={UserGroupItem}
                rendererParams={userGroupRendererParams}
                rendererClassName={styles.userGroupItem}
                filtered={false}
                pending={usergroupGetPending}
                errored={false}
                emptyIcon={(
                    <Kraken
                        size="large"
                        variant="experiment"
                    />
                )}
                emptyMessage="No user groups found."
                messageIconShown
                messageShown
            />
            {showAddUserGroupModal && (
                <AddUserGroupModal
                    onModalClose={setUserGroupModalHidden}
                    onSuccess={handleEditUserGroupSuccess}
                    value={usergroupObjectToEdit}
                />
            )}
        </Container>
    );
}

export default UserGroup;
