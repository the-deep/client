import React, { useMemo, useCallback } from 'react';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
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
    UserGroup,
    MultiResponse,
} from '#types';
import { ProjectRole } from '#types/project';
import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';

import styles from './styles.css';

interface UserGroupMini {
    id: string;
    usergroup: {
        id: string;
        title: string;
    }
}

interface UserGroupMembership {
    id: string;
    usergroup: {
        id: string;
        title: string;
    }
}

const usergroupKeySelector = (d: UserGroupMini) => d.usergroup.id;
const usergroupLabelSelector = (d: UserGroupMini) => d.usergroup.title;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: string;
    usergroup: {
        id: string;
        title: string;
    }
    role: number;
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
    role: number;
    usergroup?: number;
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

    const formValue: PartialForm<FormType> = usergroupValue ?? defaultFormValue;
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

    const queryForUsergroups = useMemo(() => ({
        members_exclude_project: projectId,
    }), [projectId]);

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
    });

    const {
        pending: pendingUsergroupList,
        response: usergroupResponse,
    } = useRequest<MultiResponse<UserGroup>>({
        url: 'server://user-groups/',
        method: 'GET',
        query: queryForUsergroups,
    });

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

    const usergroupList = useMemo(() => {
        if (isNotDefined(usergroupValue)) {
            return usergroupResponse?.results ?? [];
        }
        return [
            ...(usergroupResponse?.results ?? []),
            {
                id: usergroupValue?.id,
                usergroup: {
                    id: usergroupValue?.usergroup.id,
                    title: usergroupValue?.usergroup.title,
                },
            },
        ];
    }, [usergroupResponse, usergroupValue]);

    const pendingRequests = pendingRoles || pendingUsergroupList;

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
                options={usergroupList}
                readOnly={isDefined(usergroupValue)}
                keySelector={usergroupKeySelector}
                labelSelector={usergroupLabelSelector}
                onChange={setFieldValue}
                value={value.usergroup?.id}
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
