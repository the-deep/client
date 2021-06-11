import React, { useCallback } from 'react';
import { isDefined, isTruthyString } from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    requiredCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    PasswordInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/ui/NonFieldError';
import { useLazyRequest } from '#utils/request';
import _ts from '#ts';
import { User } from '#typings';

type FormType = {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type FormSchemaFieldDepenencies = ReturnType<NonNullable<FormSchema['fieldDependencies']>>;


function sameWithPasswordCondition(
    password: string | undefined,
    value: PartialForm<FormType>,
) {
    if (
        isTruthyString(value?.newPassword)
        && isTruthyString(password)
        && value.newPassword !== password
    ) {
        return _ts('changePassword', 'passwordMismatch');
    }

    return undefined;
}

const changePasswordSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        oldPassword: [
            requiredCondition,
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
        ],
        newPassword: [
            requiredCondition,
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
        ],
        confirmPassword: [
            requiredCondition,
            sameWithPasswordCondition,
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
        ],
    }),
    fieldDependencies: (): FormSchemaFieldDepenencies => ({
        confirmPassword: ['newPassword'],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

export interface Props {
    onModalClose: () => void;
}

function ChangePasswordModal(props: Props) {
    const {
        onModalClose,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(defaultFormValue, changePasswordSchema);

    const {
        pending,
        trigger: changePassword,
    } = useLazyRequest<User, Pick<FormType, 'oldPassword' | 'newPassword'>>({
        url: 'server://users/me/change-password/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onModalClose();
        },
        onFailure: (err) => {
            onErrorSet({ fields: { ...err.value.faramErrors } });
        },
        failureHeader: _ts('changePassword', 'title'),
    });

    const handleSubmitButtonClick = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            changePassword({ oldPassword: val.oldPassword, newPassword: val.newPassword });
        }
    }, [onErrorSet, validate, changePassword]);

    return (
        <Modal
            heading={_ts('changePassword', 'title')}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        disabled={pristine || pending}
                        onClick={onModalClose}
                    >
                        {_ts('changePassword', 'cancel')}
                    </Button>
                    <Button
                        name={undefined}
                        variant="primary"
                        type="submit"
                        disabled={pristine || pending}
                        onClick={handleSubmitButtonClick}
                    >
                        {_ts('changePassword', 'change')}
                    </Button>
                </>
            )}
        >
            <NonFieldError error={error} />
            <PasswordInput
                name="oldPassword"
                type="password"
                label={_ts('changePassword', 'currentPassword')}
                placeholder={_ts('changePassword', 'currentPassword')}
                value={value.oldPassword}
                error={error?.fields?.oldPassword}
                disabled={pending}
                onChange={onValueChange}
            />
            <PasswordInput
                name="newPassword"
                type="password"
                label={_ts('changePassword', 'newPassword')}
                placeholder={_ts('changePassword', 'newPassword')}
                value={value.newPassword}
                error={error?.fields?.newPassword}
                disabled={pending}
                onChange={onValueChange}
            />
            <PasswordInput
                name="confirmPassword"
                type="password"
                label={_ts('changePassword', 'retypePassword')}
                placeholder={_ts('changePassword', 'retypePassword')}
                value={value.confirmPassword}
                error={error?.fields?.confirmPassword}
                disabled={pending}
                onChange={onValueChange}
            />
        </Modal>
    );
}

export default ChangePasswordModal;
