import React, { useCallback } from 'react';
import { isTruthyString } from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
    getErrorObject,
    internal,
    createSubmitHandler,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    PasswordInput,
} from '@the-deep/deep-ui';

import NonFieldError from '#components/NonFieldError';
import { useLazyRequest } from '#base/utils/restRequest';
import _ts from '#ts';
import { User } from '#types';

import styles from './styles.css';

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
            requiredStringCondition,
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
        ],
        newPassword: [
            requiredStringCondition,
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
        ],
        confirmPassword: [
            requiredStringCondition,
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
        body: (ctx) => ctx,
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
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                changePassword({ oldPassword: val.oldPassword, newPassword: val.newPassword });
            },
        );
        submit();
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
            bodyClassName={styles.modalBody}
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
