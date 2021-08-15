import React, { useCallback, useState, useRef, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Button,
    Modal,
    TextInput,
    PendingMessage,
} from '@the-deep/deep-ui';
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

import _ts from '#ts';

import styles from './styles.css';

interface Props {
    className?: string;
    onClose: () => void;
    email?: string;
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
        onClose,
        email,
    } = props;

    const elementRef = useRef<Captcha>(null);
    const [success, setSuccess] = useState(false);

    const initialValue = useMemo(
        (): FormType => (email ? { email } : defaultFormValue),
        [email],
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
        <>
            {resetPending && <PendingMessage />}
            <Modal
                className={_cs(styles.passwordResetForm, className)}
                headingSize="small"
                heading={_ts('explore.passwordReset', 'forgotPasswordModalHeading')}
                footerActions={!success && (
                    <Button
                        disabled={pristine || resetPending}
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        name="login"
                    >
                        {_ts('explore.passwordReset', 'resetPasswordButtonLabel')}
                    </Button>
                )}
                onCloseButtonClick={onClose}
                bodyClassName={styles.content}
            >
                {success ? (
                    <div className={styles.passwordResetSuccess}>
                        {_ts('explore.passwordReset', 'checkYourEmailText', { email: context?.email })}
                    </div>
                ) : (
                    <>
                        <NonFieldError
                            className={styles.error}
                            error={error}
                        />
                        <TextInput
                            name="email"
                            className={styles.input}
                            onChange={setFieldValue}
                            value={value?.email}
                            error={error?.email}
                            label={_ts('explore.passwordReset', 'emailLabel')}
                            placeholder={_ts('explore.passwordReset', 'emailPlaceholder')}
                            disabled={resetPending}
                            autoFocus
                        />
                        <HCaptcha
                            className={styles.input}
                            name="hcaptchaResponse"
                            elementRef={elementRef}
                            siteKey={HCaptchaSiteKey}
                            onChange={setFieldValue}
                            error={error?.hcaptchaResponse}
                            disabled={resetPending}
                        />
                    </>
                )}
            </Modal>
        </>
    );
}

export default ForgotPasswordModal;
