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
} from '@togglecorp/toggle-form';
import {
    Modal,
    SelectInput,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import { useRequest, useLazyRequest } from '#utils/request';
import {
    UserGroup,
    MultiResponse,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';
import NonFieldError from '#newComponents/ui/NonFieldError';

import styles from './styles.scss';

interface UserGroupMini {
    id: number;
    title: string;
}

interface UserGroupMembership {
    id: number;
    title: string;
    usergroup: number;
}

const usergroupKeySelector = (d: UserGroupMini) => d.id;
const usergroupLabelSelector = (d: UserGroupMini) => d.title;

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: number;
    usergroup?: number;
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
    projectId: number;
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
        failureHeader: _ts('projectEdit', 'projectRoleFetchFailed'),
    });

    const {
        pending: pendingUsergroupList,
        response: usergroupResponse,
    } = useRequest<MultiResponse<UserGroup>>({
        url: 'server://user-groups/',
        method: 'GET',
        query: queryForUsergroups,
        failureHeader: _ts('projectEdit', 'usergroupFetchFailed'),
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
        body: ctx => ctx,
        onSuccess: () => {
            onTableReload();
            onModalClose();
        },
        failureHeader: _ts('projectEdit', 'projectUsergroupPostFailedLabel'),
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                triggerAddUserGroup(val as ValueToSend);
            }
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
                id: usergroupValue.usergroup,
                title: usergroupValue.title,
            },
        ];
    }, [usergroupResponse, usergroupValue]);

    const pendingRequests = pendingRoles || pendingUsergroupList;

    const roles = isDefined(activeUserRoleLevel)
        ? projectRolesResponse?.results.filter(
            role => role.level >= activeUserRoleLevel,
        )
        : undefined;

    return (
        <Modal
            className={styles.modal}
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
                className={styles.input}
                options={usergroupList}
                readOnly={isDefined(usergroupValue)}
                keySelector={usergroupKeySelector}
                labelSelector={usergroupLabelSelector}
                optionsPopupClassName={styles.optionsPopup}
                onChange={setFieldValue}
                value={value.usergroup}
                error={error?.usergroup}
                label={_ts('projectEdit', 'usergroupLabel')}
                placeholder={_ts('projectEdit', 'selectUsergroupPlaceholder')}
            />
            <SelectInput
                name="role"
                className={styles.input}
                options={roles}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                optionsPopupClassName={styles.optionsPopup}
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
