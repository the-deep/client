import React, { useMemo, useCallback, useState } from 'react';
import {
    isDefined,
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
import NonFieldError from '#components/ui/NonFieldError';
import { useRequest, useLazyRequest } from '#utils/request';
import { MultiResponse, BasicUser, Membership } from '#typings';
import UserSelectInput from '#components/input/UserSelectInput';
import _ts from '#ts';

import styles from './styles.scss';

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

    const [
        userOptions,
        setUserOptions,
    ] = useState<BasicUser[] | undefined | null>();
    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(formValueFromProps, schema);

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
        body: ctx => ctx,
        onSuccess: () => {
            onTableReload();
            onModalClose();
        },
        failureHeader: _ts('analyticalFramework.addUser', 'membershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            if (!errored && isDefined(val)) {
                triggerAddFrameworkMember({ ...val, framework: frameworkId } as ValueToSend);
            }
        },
        [onErrorSet, validate, triggerAddFrameworkMember, frameworkId],
    );

    const currentUser = useMemo(() => (userValue ?
        [{ id: userValue.member, displayName: userValue.memberName }] : []
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
            {pendingAddAction && (<LoadingAnimation />)}
            <NonFieldError error={error} />
            <UserSelectInput
                className={styles.input}
                queryParams={queryForUsers}
                name="member"
                readOnly={isDefined(userValue)}
                value={value.member}
                onChange={onValueChange}
                options={userOptions ?? currentUser}
                onOptionsChange={setUserOptions}
                error={error?.fields?.member}
                disabled={pendingRequests}
                optionsPopupClassName={styles.optionsPopup}
                label={_ts('analyticalFramework.addUser', 'userLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectUserPlaceholder')}
            />
            <SelectInput
                name="role"
                className={styles.input}
                options={frameworkRolesResponse?.results}
                keySelector={roleKeySelector}
                labelSelector={roleLabelSelector}
                optionsPopupClassName={styles.optionsPopup}
                onChange={onValueChange}
                value={value.role}
                label={_ts('analyticalFramework.addUser', 'roleLabel')}
                placeholder={_ts('analyticalFramework.addUser', 'selectRolePlaceholder')}
                error={error?.fields?.role}
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddUserModal;
