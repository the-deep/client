import React, { useMemo, useCallback, useState } from 'react';
import {
    isDefined,
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

import NonFieldError from '#newComponents/ui/NonFieldError';
import UserSelectInput from '#newComponents/input/UserSelectInput';
import { useRequest, useLazyRequest } from '#utils/request';
import {
    MultiResponse,
    BasicUser,
    Membership,
} from '#types';
import { ProjectRole } from '#types/project';
import _ts from '#ts';

import styles from './styles.scss';

const roleKeySelector = (d: ProjectRole) => d.id;
const roleLabelSelector = (d: ProjectRole) => d.title;

type FormType = {
    id?: number;
    member?: number;
    role: number;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (isDefined(value?.id)) {
            return ({
                role: [requiredCondition],
            });
        }
        return ({
            member: [requiredCondition],
            role: [requiredCondition],
        });
    },
};

const defaultFormValue: PartialForm<FormType> = {};

interface ValueToSend {
    role: number;
    member?: number;
}

interface Props {
    onModalClose: () => void;
    projectId: number;
    onTableReload: () => void;
    userValue?: Membership;
    activeUserRoleLevel?: number;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        projectId,
        onTableReload,
        userValue,
        activeUserRoleLevel,
    } = props;

    const formValueFromProps: PartialForm<FormType> = userValue ?? defaultFormValue;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValueFromProps);

    const error = getErrorObject(riskyError);

    const queryForUsers = useMemo(() => ({
        members_exclude_project: projectId,
    }), [projectId]);

    const [
        userOptions,
        setUserOptions,
    ] = useState<BasicUser[] | undefined | null>();

    const {
        pending: pendingRoles,
        response: projectRolesResponse,
    } = useRequest<MultiResponse<ProjectRole>>({
        url: 'server://project-roles/',
        method: 'GET',
        failureHeader: _ts('projectEdit', 'projectRoleFetchFailed'),
    });

    const {
        pending: pendingAddAction,
        trigger: triggerAddProjectMember,
    } = useLazyRequest<unknown, ValueToSend>({
        url: isDefined(userValue)
            ? `server://projects/${projectId}/project-memberships/${userValue.id}/`
            : `server://projects/${projectId}/project-memberships/`,
        method: isDefined(userValue)
            ? 'PATCH'
            : 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onTableReload();
            onModalClose();
        },
        failureHeader: _ts('projectEdit', 'projectMembershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                triggerAddProjectMember(val as ValueToSend);
            }
        },
        [setError, validate, triggerAddProjectMember],
    );

    const currentUser = useMemo(() => (userValue ?
        [{ id: userValue.member, displayName: userValue.memberName }] : []
    ), [userValue]);

    const pendingRequests = pendingRoles;

    const roles = isDefined(activeUserRoleLevel)
        ? projectRolesResponse?.results.filter(
            role => role.level >= activeUserRoleLevel,
        )
        : undefined;

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(userValue)
                    ? _ts('projectEdit', 'editUserHeading')
                    : _ts('projectEdit', 'addUserHeading')
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
            <UserSelectInput
                className={styles.input}
                queryParams={queryForUsers}
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member}
                onChange={setFieldValue}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.member}
                disabled={pendingRequests}
                optionsPopupClassName={styles.optionsPopup}
                label={_ts('projectEdit', 'userLabel')}
                placeholder={_ts('projectEdit', 'selectUserPlaceholder')}
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
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddUserModal;
