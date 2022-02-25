import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
} from '@togglecorp/fujs';
import { useQuery, gql } from '@apollo/client';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Modal,
    SelectInput,
    Button,
    PendingMessage,
    useAlert,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import {
    MultiResponse,
} from '#types';
import { ProjectRole } from '#types/project';
import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';

import {
    UserGroupsQuery,
    UserGroupsQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const USERGROUPS = gql`
    query UserGroups($membersExcludeProject: ID) {
        userGroups(membersExcludeProject: $membersExcludeProject) {
            results {
              id
              title
              createdAt
              description
              createdBy {
                id
                displayName
              }
            }
            totalCount
            pageSize
            page
        }
    }
`;

interface UserGroupMini {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

interface UserGroupMembership {
    id: string;
    usergroup: {
        id: string;
        title: string;
    }
    role: {
        id: string;
        title: string;
    }
}

const usergroupKeySelector = (d: UserGroupMini) => d.id;
const usergroupLabelSelector = (d: UserGroupMini) => d.title;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: string;
    usergroup: string;
    role: string;
};
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (isDefined(value?.id)) {
            return ({
                role: [requiredCondition],
            });
        }
        return ({
            usergroup: [requiredCondition],
            role: [requiredCondition],
        });
    },
};

interface ValueToSend {
    role: string;
    usergroup: string;
}

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    projectId: string;
    onTableReload: () => void;
    usergroupValue?: UserGroupMembership;
    activeUserRoleLevel?: number;
}

function AddUserGroupModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onTableReload,
        usergroupValue,
        activeUserRoleLevel,
    } = props;

    const formValue: PartialForm<FormType> = usergroupValue ? {
        id: usergroupValue.id,
        usergroup: usergroupValue.usergroup.id,
        role: usergroupValue.role.id,
    } : defaultFormValue;

    const alert = useAlert();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValue);

    const error = getErrorObject(riskyError);

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
    });

    const membershipVariables = useMemo(
        (): UserGroupsQueryVariables | undefined => ({
            membersExcludeProject: projectId,
        }),
        [projectId],
    );

    const {
        data: userGroupsResponse,
        loading: pendingUserGroups,
    } = useQuery<UserGroupsQuery, UserGroupsQueryVariables>(
        USERGROUPS,
        {
            variables: membershipVariables,
        },
    );

    const {
        pending: pendingAddAction,
        trigger: triggerAddUserGroup,
    } = useLazyRequest<unknown, ValueToSend>({
        url: isDefined(usergroupValue)
            ? `server://projects/${projectId}/project-usergroups/${usergroupValue.id}/`
            : `server://projects/${projectId}/project-usergroups/`,
        method: isDefined(usergroupValue)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            onTableReload();
            onModalClose();
            alert.show(
                isDefined(usergroupValue)
                    ? 'Successfully updated user group.'
                    : 'Successfully added user group.',
                { variant: 'success' },
            );
        },
        failureMessage: isDefined(usergroupValue)
            ? 'Failed to update user group.'
            : 'Failed to create user group.',
    });

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => triggerAddUserGroup(val as ValueToSend),
            );
            submit();
        },
        [setError, validate, triggerAddUserGroup],
    );

    const pendingRequests = pendingRoles || pendingUserGroups;

    const roles = isDefined(activeUserRoleLevel)
        ? projectRolesResponse?.results.filter(
            (role) => role.level >= activeUserRoleLevel,
        )
        : undefined;

    return (
        <Modal
            className={styles.modal}
            freeHeight
            size="small"
            heading={
                isDefined(usergroupValue)
                    ? _ts('projectEdit', 'editUsergroupHeading')
                    : _ts('projectEdit', 'addUsergroupHeading')
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || pendingRequests || pendingAddAction}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddAction && (<PendingMessage />)}
            <NonFieldError error={error} />
            <SelectInput
                name="usergroup"
                options={userGroupsResponse?.userGroups?.results}
                readOnly={isDefined(usergroupValue)}
                keySelector={usergroupKeySelector}
                labelSelector={usergroupLabelSelector}
                onChange={setFieldValue}
                value={value.usergroup}
                error={error?.usergroup}
                label={_ts('projectEdit', 'usergroupLabel')}
                placeholder={_ts('projectEdit', 'selectUsergroupPlaceholder')}
            />
            <SelectInput
                name="role"
                options={roles}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                onChange={setFieldValue}
                value={value.role}
                error={error?.role}
                label={_ts('projectEdit', 'roleLabel')}
                placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
            />
        </Modal>
    );
}

export default AddUserGroupModal;
