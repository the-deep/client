import React, { useMemo, useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    useAlert,
    Modal,
    SelectInput,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { useRequest, useLazyRequest } from '#base/utils/restRequest';
import { MultiResponse, BasicUser, Membership } from '#types';
import UserSelectInput from '#components/selections/UserSelectInput';
import _ts from '#ts';

import styles from './styles.css';

type Member = Pick<Membership, 'id' | 'member' | 'memberName' | 'role'>;
interface Role {
    id: number;
    title: string;
}

const roleKeySelector = (d: Role) => d.id;
const roleLabelSelector = (d: Role) => d.title;

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
    framework: number;
}

interface Props {
    onModalClose: () => void;
    frameworkId: number;
    onTableReload: () => void;
    isPrivateFramework: boolean;
    userValue?: Member;
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        frameworkId,
        onTableReload,
        userValue,
        isPrivateFramework,
    } = props;

    const formValueFromProps: PartialForm<FormType> = userValue ?? defaultFormValue;
    const alert = useAlert();

    const [
        userOptions,
        setUserOptions,
    ] = useState<BasicUser[] | undefined | null>();
    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValueFromProps);

    const error = getErrorObject(riskyError);

    const queryForRoles = useMemo(
        () => (isPrivateFramework ? ({ is_default_role: false }) : undefined),
        [isPrivateFramework],
    );

    const queryForUsers = useMemo(() => ({
        members_exclude_framework: frameworkId,
    }), [frameworkId]);

    const {
        pending: pendingRoles,
        response: frameworkRolesResponse,
    } = useRequest<MultiResponse<Role>>({
        url: isPrivateFramework
            ? 'server://private-framework-roles/'
            : 'server://public-framework-roles/',
        method: 'GET',
        query: queryForRoles,
        failureHeader: _ts('analyticalFramework.addUser', 'roleFetchFailed'),
    });

    const {
        pending: pendingAddAction,
        trigger: triggerAddFrameworkMember,
    } = useLazyRequest<unknown, ValueToSend>({
        url: isDefined(userValue)
            ? `server://framework-memberships/${userValue.id}/`
            : 'server://framework-memberships/',
        method: isDefined(userValue)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            if (userValue?.id) {
                alert.show(
                    'Successfully updated user permissions.',
                    {
                        variant: 'success',
                    },
                );
            } else {
                alert.show(
                    'Successfully added user to the analytical framework.',
                    {
                        variant: 'success',
                    },
                );
            }
            onTableReload();
            onModalClose();
        },
        failureHeader: _ts('analyticalFramework.addUser', 'membershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                triggerAddFrameworkMember({ ...val, framework: frameworkId } as ValueToSend);
            }
        },
        [setError, validate, triggerAddFrameworkMember, frameworkId],
    );

    const currentUser = useMemo(() => (userValue
        ? [{ id: userValue.member, displayName: userValue.memberName }]
        : []
    ), [userValue]);

    const pendingRequests = pendingRoles;

    return (
        <Modal
            className={styles.modal}
            heading={
                isDefined(userValue)
                    ? _ts('analyticalFramework.addUser', 'editUserHeading')
                    : _ts('analyticalFramework.addUser', 'addUserHeading')
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
                    {_ts('analyticalFramework.addUser', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddAction && (<PendingMessage />)}
            <NonFieldError error={error} />
            <UserSelectInput
                queryParams={queryForUsers}
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member}
                onChange={setFieldValue}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.member}
                disabled={pendingRequests}
                label={_ts('analyticalFramework.addUser', 'userLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectUserPlaceholder')}
            />
            <SelectInput
                name="role"
                options={frameworkRolesResponse?.results}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                onChange={setFieldValue}
                value={value.role}
                label={_ts('analyticalFramework.addUser', 'roleLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectRolePlaceholder')}
                error={error?.role}
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddUserModal;
