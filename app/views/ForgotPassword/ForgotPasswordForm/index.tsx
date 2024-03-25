import React, { useCallback, useState, useRef, useMemo } from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import {
    Button,
    Link,
    Container,
    TextInput,
    PendingMessage,
    useAlert,
} from '@the-deep/deep-ui';
import {
    generatePath,
    useLocation,
} from 'react-router-dom';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    requiredStringCondition,
    internal,
    getErrorObject,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';
import { gql, useMutation } from '@apollo/client';

import NonFieldError from '#components/NonFieldError';
import { hCaptchaKey } from '#base/configs/hCaptcha';
import HCaptcha from '#components/HCaptcha';
import routes from '#base/configs/routes';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import {
    ResetPasswordInputType,
    ResetPasswordMutation,
    ResetPasswordMutationVariables,
} from '#generated/types';
import _ts from '#ts';

import styles from './styles.css';

const RESET_PASSWORD = gql`
    mutation ResetPassword($data: ResetPasswordInputType!) {
        resetPassword(data: $data) {
            ok
            errors
        }
    }
`;

interface Props {
    className?: string;
}

type FormType = Partial<ResetPasswordMutationVariables['data']>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: [emailCondition, requiredStringCondition],
        captcha: [requiredStringCondition],
    }),
};

const defaultFormValue: FormType = {};

function ForgotPasswordModal(props: Props) {
    const {
        className,
    } = props;
    const {
        state,
    } = useLocation();
    const alert = useAlert();

    const emailFromState = (state as { email?: string } | undefined)?.email;
    const elementRef = useRef<Captcha>(null);
    const [success, setSuccess] = useState(false);

    const initialValue = useMemo(
        (): FormType => (emailFromState ? { email: emailFromState } : defaultFormValue),
        [emailFromState],
    );

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const [
        resetPassword,
        { loading },
    ] = useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(
        RESET_PASSWORD,
        {
            onCompleted: (response) => {
                const { resetPassword: resetPasswordResponse } = response;

                if (resetPasswordResponse?.ok) {
                    setSuccess(true);
                } else {
                    alert.show(
                        'Failed to reset password.',
                        { variant: 'error' },
                    );
                }

                if (resetPasswordResponse?.errors) {
                    const formError = transformToFormError(
                        removeNull(resetPasswordResponse.errors) as ObjectError[],
                    );
                    setError(formError);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
                alert.show(
                    'Failed to reset password.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(
        (val: FormType) => {
            elementRef.current?.resetCaptcha();
            resetPassword({
                variables: {
                    data: val as ResetPasswordInputType,
                },
            });
        },
        [resetPassword],
    );

    return (
        <form
            className={_cs(styles.passwordResetForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            {loading && <PendingMessage />}
            <Container
                className={styles.passwordResetContainer}
                heading="Forgot Password"
                headingSize="medium"
                contentClassName={styles.inputContainer}
                headingDescription={(
                    <div className={styles.headingDescription}>
                        <span>
                            Remember your password?
                        </span>
                        <Link
                            to={generatePath(routes.login.path, {})}
                        >
                            Login
                        </Link>
                    </div>
                )}
            >
                {success ? (
                    <div className={styles.passwordResetSuccess}>
                        {_ts('explore.passwordReset', 'checkYourEmailText', { email: value?.email })}
                    </div>
                ) : (
                    <>
                        <NonFieldError error={error} />
                        <TextInput
                            name="email"
                            onChange={setFieldValue}
                            value={value?.email}
                            error={error?.email}
                            label={_ts('explore.passwordReset', 'emailLabel')}
                            placeholder={_ts('explore.passwordReset', 'emailPlaceholder')}
                            disabled={loading}
                            autoFocus
                        />
                        <HCaptcha
                            name="captcha"
                            elementRef={elementRef}
                            siteKey={hCaptchaKey}
                            onChange={setFieldValue}
                            error={error?.captcha}
                            disabled={loading}
                        />
                        <Button
                            disabled={pristine || loading}
                            type="submit"
                            variant="primary"
                            name="resetPassword"
                        >
                            {_ts('explore.passwordReset', 'resetPasswordButtonLabel')}
                        </Button>
                    </>
                )}
            </Container>
        </form>
    );
}

export default ForgotPasswordModal;
