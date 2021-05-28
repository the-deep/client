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
} from '@togglecorp/toggle-form';
import {
    Modal,
    SelectInput,
    Button,
} from '@the-deep/deep-ui';

import LoadingAnimation from '#rscv/LoadingAnimation';
import { useRequest, useLazyRequest } from '#utils/request';
import { notifyOnFailure } from '#utils/requestNotify';
import {
    UserGroup,
    MultiResponse,
} from '#typings';
import { ProjectRole } from '#typings/project';
import _ts from '#ts';

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
        if (isDefined(value.id)) {
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
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(formValue, schema);

    const queryForUsergroups = useMemo(() => ({
        members_exclude_project: projectId,
    }), [projectId]);

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectRoleFetchFailed'))({ error: errorBody });
        },
    });

    const {
        pending: pendingUsergroupList,
        response: usergroupResponse,
    } = useRequest<MultiResponse<UserGroup>>({
        url: 'server://user-groups/',
        method: 'GET',
        query: queryForUsergroups,
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'usergroupFetchFailed'))({ error: errorBody });
        },
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
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('projectEdit', 'projectUsergroupPostFailedLabel'))({ error: errorBody });
        },
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                triggerAddUserGroup(val as ValueToSend);
            }
        },
        [onErrorSet, validate, triggerAddUserGroup],
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
            footerClassName={styles.footer}
            footer={(
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
            {pendingAddAction && (<LoadingAnimation />)}
            {error?.$internal && (
                <p>
                    {error?.$internal}
                </p>
            )}
            <SelectInput
                name="usergroup"
                className={styles.input}
                options={usergroupList}
                readOnly={isDefined(usergroupValue)}
                keySelector={usergroupKeySelector}
                labelSelector={usergroupLabelSelector}
                optionsPopupClassName={styles.optionsPopup}
                onChange={onValueChange}
                value={value.usergroup}
                error={error?.fields?.usergroup}
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
                onChange={onValueChange}
                value={value.role}
                error={error?.fields?.role}
                label={_ts('projectEdit', 'roleLabel')}
                placeholder={_ts('projectEdit', 'selectRolePlaceholder')}
            />
        </Modal>
    );
}

export default AddUserGroupModal;
