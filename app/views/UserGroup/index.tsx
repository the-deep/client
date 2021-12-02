import React, { useContext, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    Pager,
    PendingMessage,
    ListView,
    Kraken,
    TextOutput,
    NumberOutput,
    DateOutput,
    ControlledExpandableContainer,
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
import AddUserModal from './AddUserModal';
import Memberships from './Memberships';
import UserGroupActionCell from './UserGroupActionCell';

import styles from './styles.css';

const MAX_ITEMS_PER_PAGE = 10;
const usergroupKeySelector = (d: UserGroupType) => d.id;

interface UserGroupItemProps {
    userGroupId: number;
    activeUserId?: number;
    onUserDeleteSuccess: () => void;
    onEditClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
    onAddClick: (id: number) => void;
    data: UserGroupType;
    onExpansionChange: (usergroupExpanded: boolean, usergroupId: number) => void;
    expanded?: boolean;
    autoFocus?: boolean;
}

function UserGroupItem(props: UserGroupItemProps) {
    const {
        userGroupId,
        onEditClick,
        onDeleteClick,
        onAddClick,
        data,
        activeUserId,
        onUserDeleteSuccess,
        onExpansionChange,
        expanded,
        autoFocus,
    } = props;

    return (
        <ControlledExpandableContainer
            name={userGroupId}
            className={styles.userGroupItem}
            heading={data.title}
            autoFocus={autoFocus}
            withoutBorder
            spacing="comfortable"
            expansionTriggerArea="arrow"
            onExpansionChange={onExpansionChange}
            expanded={expanded}
            inlineHeadingDescription
            headerClassName={styles.userGroupHeader}
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            headerDescriptionClassName={styles.headingDescriptionContainer}
            contentClassName={styles.userGroupContent}
            headingDescription={(
                <>
                    <TextOutput
                        label="Created On"
                        value={(
                            <DateOutput
                                value={data.createdAt}
                                format="hh:mm aaa, MMM dd, yyyy"
                            />
                        )}
                        hideLabelColon
                    />
                    <TextOutput
                        label="Members"
                        labelContainerClassName={styles.membersLabel}
                        valueContainerClassName={styles.membersValue}
                        value={(
                            <NumberOutput
                                value={data.membersCount ?? 0}
                            />
                        )}
                        hideLabelColon
                    />
                </>
            )}
            headerActions={(
                <UserGroupActionCell
                    itemKey={userGroupId}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    onAddClick={onAddClick}
                    addButtonTitle={_ts('usergroup', 'addMemberLabel')}
                    editButtonTitle={_ts('usergroup', 'editUserGroupLabel')}
                    deleteButtonTitle={_ts('usergroup', 'deleteUserGroupLabel')}
                    deleteConfirmationMessage={_ts('usergroup', 'deleteUserGroupConfirmMessage')}
                    disabled={data.role === 'normal'}
                />
            )}
        >
            <Memberships
                userGroup={userGroupId}
                canEdit={data.role === 'admin'}
                activeUserId={activeUserId}
                onUserDeleteSuccess={onUserDeleteSuccess}
            />
        </ControlledExpandableContainer>
    );
}

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

    const userId = user ? +user?.id : undefined;

    const [activePage, setActivePage] = useState<number>(1);
    const [expandedUserGroupId, setExpandedUserGroupId] = useState<number | undefined>();

    const [activeUserGroupId, setActiveUserGroupId] = useState<number | undefined>();
    const [usergroupToEdit, setUserGroupToEdit] = useState<number | undefined>();

    const [
        showAddUserGroupModal,
        setUserGroupModalShow,
        setUserGroupModalHidden,
    ] = useModalState(false);

    const [
        showAddUserModal,
        setUserModalShow,
        setUserModalHidden,
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
        retrigger: usergroupResponseTrigger,
    } = useRequest<MultiResponse<UserGroupType>>({
        url: 'server://user-groups/member-of/',
        method: 'GET',
        query: usergroupQuery,
        failureHeader: _ts('usergroup', 'fetchUserGroupFailed'),
    });

    const {
        trigger: usergroupDeleteTrigger,
    } = useLazyRequest<unknown, number>({
        url: (ctx) => `server://user-groups/${ctx}/`,
        method: 'DELETE',
        onSuccess: () => {
            usergroupResponseTrigger();
        },
        failureHeader: _ts('usergroup', 'usergroupDeleteFailed'),
    });

    const usergroupObjectToEdit = useMemo(() => (
        usergroupResponse?.results?.find((a) => a.id === usergroupToEdit)
    ), [usergroupResponse?.results, usergroupToEdit]);

    const handleAddUserGroupClick = useCallback(() => {
        setUserGroupToEdit(undefined);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const handleEditUserGroupClick = useCallback((value) => {
        setUserGroupToEdit(value);
        setUserGroupModalShow();
    }, [setUserGroupModalShow]);

    const [autoFocusUserGroup, setAutoFocusUserGroup] = useState<number>();

    const handleEditUserGroupSuccess = useCallback((newItemId: number) => {
        setAutoFocusUserGroup(newItemId);
        usergroupResponseTrigger();
        setUserGroupModalHidden();
    }, [setUserGroupModalHidden, usergroupResponseTrigger]);

    const handleMemberAddClick = useCallback((value) => {
        setActiveUserGroupId(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const handleExpansionChange = useCallback((usergroupExpanded: boolean, usergroupId: number) => {
        setExpandedUserGroupId(usergroupExpanded ? usergroupId : undefined);
    }, []);

    const userGroupRendererParams = useCallback((key: number, datum: UserGroupType) => ({
        userGroupId: key,
        activeUserId: userId,
        onUserDeleteSuccess: usergroupResponseTrigger,
        onDeleteClick: usergroupDeleteTrigger,
        onEditClick: handleEditUserGroupClick,
        onAddClick: handleMemberAddClick,
        data: datum,
        onExpansionChange: handleExpansionChange,
        autoFocus: autoFocusUserGroup === datum.id,
        expanded: expandedUserGroupId === datum.id,
    }), [
        autoFocusUserGroup,
        userId,
        usergroupResponseTrigger,
        usergroupDeleteTrigger,
        handleEditUserGroupClick,
        handleMemberAddClick,
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
            {usergroupGetPending && <PendingMessage />}
            <ListView
                className={styles.userGroupList}
                keySelector={usergroupKeySelector}
                data={usergroupResponse?.results}
                renderer={UserGroupItem}
                rendererParams={userGroupRendererParams}
                emptyIcon={(
                    <Kraken
                        variant="experiment"
                    />
                )}
                emptyMessage="No usergroups found."
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
            {showAddUserModal && activeUserGroupId && (
                <AddUserModal
                    onModalClose={setUserModalHidden}
                    group={activeUserGroupId}
                    onUserAddSuccess={usergroupResponseTrigger}
                />
            )}
        </Container>
    );
}

export default UserGroup;
