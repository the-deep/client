import React, { useCallback, useState, useRef } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Button,
    Modal,
    TextInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';

import NonFieldError from '#components/ui/NonFieldError';
import { useLazyRequest } from '#utils/request';
import HCaptcha from '#components/ui/HCaptcha';

import _ts from '#ts';

import styles from './styles.scss';

interface Props {
    className?: string;
    onClose: () => void;
    email?: string;
}

const HCaptchaSitekey = process.env.REACT_APP_HCATPCHA_SITEKEY as string;

interface ForgotPasswordFields {
    email: string;
    hcaptchaResponse: string;
}

type FormType = Partial<ForgotPasswordFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: [emailCondition, requiredCondition],
        hcaptchaResponse: [requiredStringCondition],
    }),
};

const initialValue: FormType = {};

function ForgotPasswordModal(props: Props) {
    const {
        className,
        onClose,
        email,
    } = props;

    const elementRef = useRef<Captcha>(null);
    const [success, setSuccess] = useState(false);

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(initialValue ?? { email }, schema);

    const {
        pending: resetPending,
        trigger: triggerReset,
        context,
    } = useLazyRequest<unknown, ForgotPasswordFields>({
        url: 'server://password/reset/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            setSuccess(true);
        },
        onFailure: ({ errorCode, value: errorValue }) => {
            if (errorCode === 4004) {
                onErrorSet({
                    fields: {
                        ...errorValue.faramErrors,
                    },
                    $internal: [
                        _ts('explore.forgotPasswordModal', 'retryRecaptcha'),
                    ],
                });
            } else {
                onErrorSet({
                    fields: { ...errorValue.faramErrors },
                    $internal: errorValue.faramErrors.$internal,
                });
            }
        },
        schemaName: 'userPasswordResetResponse',
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            onErrorSet(err);
            elementRef.current?.resetCaptcha();
            if (!errored && isDefined(val)) {
                triggerReset(val as ForgotPasswordFields);
            }
        },
        [onErrorSet, validate, triggerReset],
    );

    return (
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
                        onChange={onValueChange}
                        value={value?.email}
                        error={error?.fields?.email}
                        label={_ts('explore.passwordReset', 'emailLabel')}
                        placeholder={_ts('explore.passwordReset', 'emailPlaceholder')}
                        disabled={resetPending}
                        autoFocus
                    />
                    <HCaptcha
                        className={styles.input}
                        name="hcaptchaResponse"
                        elementRef={elementRef}
                        siteKey={HCaptchaSitekey}
                        onChange={onValueChange}
                        error={error?.fields?.hcaptchaResponse}
                        disabled={resetPending}
                    />
                </>
            )}
        </Modal>
    );
}

export default ForgotPasswordModal;
