import React, { useState, useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    createSubmitHandler,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';
import { useLazyRequest } from '#utils/request';
import HCaptcha from '#components/ui/HCaptcha';
import NonFieldError from '#components/ui/NonFieldError';
import HCaptchaSiteKey from '#config/hCaptcha';

import _ts from '#ts';

import styles from './styles.scss';

interface RegisterFields {
    email: string;
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
        email: [emailCondition, requiredCondition],
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
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(initialValue, schema);

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
            if (errorCode === 4004) {
                onErrorSet({
                    fields: {
                        ...errorValue.faramErrors,
                    },
                    $internal: _ts('explore.register', 'retryRecaptcha'),
                });
            } else {
                onErrorSet({
                    fields: { ...errorValue.faramErrors },
                    $internal: errorValue.faramErrors.$internal,
                });
            }
        },
        schemaName: 'userCreateResponse',
    });

    const handleSubmit = useCallback((finalValue) => {
        elementRef.current?.resetCaptcha();
        triggerRegister({
            ...finalValue,
            username: finalValue.email,
        });
    }, [triggerRegister]);

    return (
        <form
            className={_cs(styles.registerForm, className)}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            {success ? (
                <div className={styles.registerSuccess}>
                    {_ts('explore.register', 'checkYourEmailText', { email: context?.email })}
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
                            onChange={onValueChange}
                            error={error?.fields?.hcaptchaResponse}
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
                        onChange={onValueChange}
                        value={value?.firstName}
                        error={error?.fields?.firstName}
                        label={_ts('explore.register', 'firstNameLabel')}
                        placeholder={_ts('explore.register', 'firstNamePlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="lastName"
                        className={styles.input}
                        onChange={onValueChange}
                        value={value?.lastName}
                        error={error?.fields?.lastName}
                        label={_ts('explore.register', 'lastNameLabel')}
                        placeholder={_ts('explore.register', 'lastNamePlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="organization"
                        className={styles.input}
                        onChange={onValueChange}
                        value={value?.organization}
                        error={error?.fields?.organization}
                        label={_ts('explore.register', 'organizationLabel')}
                        placeholder={_ts('explore.register', 'organizationPlaceholder')}
                        disabled={registerPending}
                    />
                    <TextInput
                        name="email"
                        className={styles.input}
                        onChange={onValueChange}
                        value={value?.email}
                        error={error?.fields?.email}
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
