import React, { useCallback, useState, useRef, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Button,
    Link,
    Container,
    TextInput,
    PendingMessage,
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
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';

import NonFieldError from '#components/NonFieldError';
import HCaptchaSiteKey from '#base/configs/hCaptcha';
import { useLazyRequest } from '#base/utils/restRequest';
import HCaptcha from '#components/HCaptcha';
import routes from '#base/configs/routes';

import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
}

interface ForgotPasswordFields {
    email: string;
    hcaptchaResponse: string;
}

type FormType = Partial<ForgotPasswordFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: [emailCondition, requiredStringCondition],
        hcaptchaResponse: [requiredStringCondition],
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

    const {
        pending: resetPending,
        trigger: triggerReset,
        context,
    } = useLazyRequest<unknown, ForgotPasswordFields>({
        url: 'server://password/reset/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            setSuccess(true);
        },
        onFailure: ({ errorCode, value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;
            if (errorCode === 4004) {
                setError({
                    ...otherErrors,
                    [internal]: _ts('explore.forgotPasswordModal', 'retryRecaptcha'),
                });
            } else {
                setError({
                    ...otherErrors,
                    [internal]: $internal,
                });
            }
        },
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                elementRef.current?.resetCaptcha();
                triggerReset(val as ForgotPasswordFields);
            }
        },
        [setError, validate, triggerReset],
    );

    return (
        <div className={_cs(styles.passwordResetForm, className)}>
            {resetPending && <PendingMessage />}
            {success ? (
                <div className={styles.passwordResetSuccess}>
                    {_ts('explore.passwordReset', 'checkYourEmailText', { email: context?.email })}
                </div>
            ) : (
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
                    <NonFieldError error={error} />
                    <TextInput
                        name="email"
                        onChange={setFieldValue}
                        value={value?.email}
                        error={error?.email}
                        label={_ts('explore.passwordReset', 'emailLabel')}
                        placeholder={_ts('explore.passwordReset', 'emailPlaceholder')}
                        disabled={resetPending}
                        autoFocus
                    />
                    <HCaptcha
                        name="hcaptchaResponse"
                        elementRef={elementRef}
                        siteKey={HCaptchaSiteKey}
                        onChange={setFieldValue}
                        error={error?.hcaptchaResponse}
                        disabled={resetPending}
                    />
                    <Button
                        disabled={pristine || resetPending}
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        name="login"
                    >
                        {_ts('explore.passwordReset', 'resetPasswordButtonLabel')}
                    </Button>
                </Container>
            )}
        </div>
    );
}

export default ForgotPasswordModal;
