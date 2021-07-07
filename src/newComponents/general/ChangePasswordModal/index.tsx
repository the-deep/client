import React, { useCallback } from 'react';
import { isDefined, isTruthyString } from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    requiredCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
    getErrorObject,
    internal,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    PasswordInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#newComponents/ui/NonFieldError';
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
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(changePasswordSchema, defaultFormValue);

    const error = getErrorObject(riskyError);

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
        onFailure: ({ value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;
            setError({
                ...otherErrors,
                [internal]: $internal,
            });
        },
        failureHeader: _ts('changePassword', 'title'),
    });

    const handleSubmitButtonClick = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            changePassword({ oldPassword: val.oldPassword, newPassword: val.newPassword });
        }
    }, [setError, validate, changePassword]);

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
                error={error?.oldPassword}
                disabled={pending}
                onChange={setFieldValue}
            />
            <PasswordInput
                name="newPassword"
                type="password"
                label={_ts('changePassword', 'newPassword')}
                placeholder={_ts('changePassword', 'newPassword')}
                value={value.newPassword}
                error={error?.newPassword}
                disabled={pending}
                onChange={setFieldValue}
            />
            <PasswordInput
                name="confirmPassword"
                type="password"
                label={_ts('changePassword', 'retypePassword')}
                placeholder={_ts('changePassword', 'retypePassword')}
                value={value.confirmPassword}
                error={error?.confirmPassword}
                disabled={pending}
                onChange={setFieldValue}
            />
        </Modal>
    );
}

export default ChangePasswordModal;
