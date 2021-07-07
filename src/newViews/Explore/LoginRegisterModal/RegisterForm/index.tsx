import React, { useState, useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    Button,
    PendingMessage,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    createSubmitHandler,
    requiredCondition,
    requiredStringCondition,
    internal,
    getErrorObject,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';
import { useLazyRequest } from '#utils/request';
import HCaptcha from '#newComponents/ui/HCaptcha';
import NonFieldError from '#newComponents/ui/NonFieldError';
import HCaptchaSiteKey from '#config/hCaptcha';

import _ts from '#ts';

import styles from './styles.scss';

interface RegisterFields {
    username: string;
    firstName: string;
    lastName: string;
    organization: string;
    hcaptchaResponse: string;
}

type FormType = Partial<RegisterFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: [emailCondition, requiredCondition],
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [requiredStringCondition],
        hcaptchaResponse: [requiredStringCondition],
    }),
};

const initialValue: FormType = {};

interface Props {
    className?: string;
}

function RegisterModal(props: Props) {
    const { className } = props;

    const elementRef = useRef<Captcha>(null);
    const [success, setSuccess] = useState(false);

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
        pending: registerPending,
        trigger: triggerRegister,
        context,
    } = useLazyRequest<unknown, RegisterFields>({
        url: 'server://users/',
        method: 'POST',
        body: ctx => ctx,
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
                    [internal]: _ts('explore.register', 'retryRecaptcha'),
                });
            } else {
                setError({
                    ...otherErrors,
                    [internal]: $internal,
                });
            }
        },
        schemaName: 'userCreateResponse',
    });

    const handleSubmit = useCallback((finalValue) => {
        elementRef.current?.resetCaptcha();
        triggerRegister(finalValue);
    }, [triggerRegister]);

    return (
        <form
            className={_cs(styles.registerForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            {registerPending && <PendingMessage />}
            {success ? (
                <div className={styles.registerSuccess}>
                    {_ts('explore.register', 'checkYourEmailText', { email: context?.username })}
                </div>
            ) : (
                <Container
                    className={styles.registerFormContainer}
                    contentClassName={styles.inputContainer}
                    heading={_ts('explore.register', 'registerFormHeader')}
                    footerContent={(
                        <HCaptcha
                            className={styles.captcha}
                            name="hcaptchaResponse"
                            elementRef={elementRef}
                            siteKey={HCaptchaSiteKey}
                            onChange={setFieldValue}
                            error={error?.hcaptchaResponse}
                            disabled={registerPending}
                        />
                    )}
                    footerActions={(
                        <Button
                            disabled={registerPending || pristine}
                            type="submit"
                            variant="primary"
                            name="register"
                        >
                            {_ts('explore.register', 'registerButtonLabel')}
                        </Button>
                    )}
                >
                    <NonFieldError
                        className={styles.error}
                        error={error}
                    />
                    <TextInput
                        name="firstName"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.firstName}
                        error={error?.firstName}
                        label={_ts('explore.register', 'firstNameLabel')}
                        placeholder={_ts('explore.register', 'firstNamePlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="lastName"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.lastName}
                        error={error?.lastName}
                        label={_ts('explore.register', 'lastNameLabel')}
                        placeholder={_ts('explore.register', 'lastNamePlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="organization"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.organization}
                        error={error?.organization}
                        label={_ts('explore.register', 'organizationLabel')}
                        placeholder={_ts('explore.register', 'organizationPlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="username"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.username}
                        error={error?.username}
                        label={_ts('explore.register', 'emailLabel')}
                        placeholder={_ts('explore.register', 'emailPlaceholder')}
                        disabled={registerPending}
                    />
                </Container>
            )}
        </form>
    );
}

export default RegisterModal;
