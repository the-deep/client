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
    removeNull,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    PasswordInput,
    useAlert,
} from '@the-deep/deep-ui';
import { gql, useMutation } from '@apollo/client';

import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';
import {
    ChangePasswordMutation,
    ChangePasswordMutationVariables,
    PasswordChangeInputType,
} from '#generated/types';
import {
    ObjectError,
    transformToFormError,
} from '#base/utils/errorTransform';

import styles from './styles.css';

const CHANGE_PASSWORD = gql`
    mutation ChangePassword($data: PasswordChangeInputType!) {
        changePassword(data: $data) {
            ok
            errors
        }
    }
`;

type FormType = {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type FormSchemaFieldDependencies = ReturnType<NonNullable<FormSchema['fieldDependencies']>>;

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
            lengthGreaterThanCondition(7),
            lengthSmallerThanCondition(129),
        ],
        newPassword: [
            requiredStringCondition,
            lengthGreaterThanCondition(7),
            lengthSmallerThanCondition(129),
        ],
        confirmPassword: [
            requiredStringCondition,
            sameWithPasswordCondition,
            lengthGreaterThanCondition(7),
            lengthSmallerThanCondition(129),
        ],
    }),
    fieldDependencies: (): FormSchemaFieldDependencies => ({
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

    const alert = useAlert();
    const error = getErrorObject(riskyError);

    const [
        changePassword,
        { loading },
    ] = useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(
        CHANGE_PASSWORD,
        {
            onCompleted: (response) => {
                const { changePassword: changePasswordResponse } = response;

                if (changePasswordResponse?.ok) {
                    onModalClose();
                    alert.show(
                        'Successfully changed password.',
                        { variant: 'success' },
                    );
                } else {
                    alert.show(
                        'Failed to change password.',
                        { variant: 'error' },
                    );
                }

                if (changePasswordResponse?.errors) {
                    const formError = transformToFormError(
                        removeNull(changePasswordResponse.errors) as ObjectError[],
                    );
                    setError(formError);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'Failed to change password.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    changePassword({
                        variables: {
                            data: {
                                oldPassword: val.oldPassword,
                                newPassword: val.newPassword,
                            } as PasswordChangeInputType,
                        },
                    });
                },
            );
            submit();
        }, [validate, setError, changePassword],
    );

    return (
        <Modal
            heading={_ts('changePassword', 'title')}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        disabled={pristine || loading}
                        onClick={onModalClose}
                    >
                        {_ts('changePassword', 'cancel')}
                    </Button>
                    <Button
                        name={undefined}
                        variant="primary"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={pristine || loading}
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
                disabled={loading}
                onChange={setFieldValue}
            />
            <PasswordInput
                name="newPassword"
                type="password"
                label={_ts('changePassword', 'newPassword')}
                placeholder={_ts('changePassword', 'newPassword')}
                value={value.newPassword}
                error={error?.newPassword}
                disabled={loading}
                onChange={setFieldValue}
            />
            <PasswordInput
                name="confirmPassword"
                type="password"
                label={_ts('changePassword', 'retypePassword')}
                placeholder={_ts('changePassword', 'retypePassword')}
                value={value.confirmPassword}
                error={error?.confirmPassword}
                disabled={loading}
                onChange={setFieldValue}
            />
        </Modal>
    );
}

export default ChangePasswordModal;
