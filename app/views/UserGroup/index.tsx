import React, { useContext, useMemo, useState, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    Button,
    Container,
    Pager,
    PendingMessage,
    ListView,
    TextOutput,
    NumberOutput,
    DateOutput,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    IoAdd,
} from 'react-icons/io5';

import {
    useRequest,
    useLazyRequest,
} from '#base/utils/restRequest';
import {
    MultiResponse,
} from '#types';
import { useModalState } from '#hooks/stateManagement';
import UserContext from '#base/context/UserContext';
import _ts from '#ts';

import AddUsergroupModal, {
    Usergroup,
} from './AddUsergroupModal';
import AddUserModal from './AddUserModal';
import Memberships from './Memberships';
import UserGroupActionCell from './UserGroupActionCell';

import styles from './styles.css';

const MAX_ITEMS_PER_PAGE = 10;
const usergroupKeySelector = (d: Usergroup) => d.id;

interface UserGroupItemProps {
    userGroupId: number;
    activeUserId?: number;
    onUserDeleteSuccess: () => void;
    onEditClick: (id: number) => void;
    onDeleteClick: (id: number) => void;
    onAddClick: (id: number) => void;
    data: Usergroup;
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
    } = props;

    return (
        <ExpandableContainer
            className={styles.userGroupItem}
            heading={data.title}
            inlineHeadingDescription
            headerClassName={styles.userGroupHeader}
            headingContainerClassName={styles.headingContainer}
            headingClassName={styles.heading}
            headerDescriptionClassName={styles.headingDescriptionContainer}
            alwaysMountContent={false}
            expansionTriggerArea="arrow"
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
                    editButtonTitle={_ts('usergroup', 'editUsergroupLabel')}
                    deleteButtonTitle={_ts('usergroup', 'deleteUsergroupLabel')}
                    deleteConfirmationMessage={_ts('usergroup', 'deleteUsergroupConfirmMessage')}
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
        </ExpandableContainer>
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

    const [activeUsergroupId, setActiveUsergroupId] = useState<number | undefined>();
    const [usergroupToEdit, setUsergroupToEdit] = useState<number | undefined>();

    const [
        showAddUserGroupModal,
        setUsergroupModalShow,
        setUsergroupModalHidden,
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
    } = useRequest<MultiResponse<Usergroup>>({
        url: 'server://user-groups/member-of/',
        method: 'GET',
        query: usergroupQuery,
        failureHeader: _ts('usergroup', 'fetchUsergroupFailed'),
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

    const handleAddUsergroupClick = useCallback(() => {
        setUsergroupToEdit(undefined);
        setUsergroupModalShow();
    }, [setUsergroupModalShow]);

    const handleEditUsergroupClick = useCallback((value) => {
        setUsergroupToEdit(value);
        setUsergroupModalShow();
    }, [setUsergroupModalShow]);

    const handleEditUsergroupSuccess = useCallback(() => {
        usergroupResponseTrigger();
        setUsergroupModalHidden();
    }, [setUsergroupModalHidden, usergroupResponseTrigger]);

    const handleMemberAddClick = useCallback((value) => {
        setActiveUsergroupId(value);
        setUserModalShow();
    }, [setUserModalShow]);

    const userGroupRendererParams = useCallback((key: number, datum: Usergroup) => ({
        userGroupId: key,
        activeUserId: userId,
        onUserDeleteSuccess: usergroupResponseTrigger,
        onDeleteClick: usergroupDeleteTrigger,
        onEditClick: handleEditUsergroupClick,
        onAddClick: handleMemberAddClick,
        data: datum,
    }), [
        userId,
        usergroupResponseTrigger,
        usergroupDeleteTrigger,
        handleEditUsergroupClick,
        handleMemberAddClick,
    ]);

    return (
        <Container
            className={_cs(styles.userGroup, className)}
            heading={_ts('usergroup', 'usergroupPageTitle')}
            headerActions={(
                <Button
                    name="addUsergroup"
                    icons={<IoAdd />}
                    onClick={handleAddUsergroupClick}
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
            />
            {showAddUserGroupModal && (
                <AddUsergroupModal
                    onModalClose={setUsergroupModalHidden}
                    onSuccess={handleEditUsergroupSuccess}
                    value={usergroupObjectToEdit}
                />
            )}
            {showAddUserModal && activeUsergroupId && (
                <AddUserModal
                    onModalClose={setUserModalHidden}
                    group={activeUsergroupId}
                    onUserAddSuccess={usergroupResponseTrigger}
                />
            )}
        </Container>
    );
}

export default UserGroup;
