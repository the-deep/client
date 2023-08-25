import React, { useState, useRef, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import {
    TextInput,
    Link,
    Button,
    PendingMessage,
    Container,
    Kraken,
    Checkbox,
    Modal,
} from '@the-deep/deep-ui';
import { generatePath } from 'react-router-dom';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    removeNull,
    createSubmitHandler,
    requiredStringCondition,
    internal,
    getErrorObject,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';

import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import HCaptcha from '#components/HCaptcha';
import NonFieldError from '#components/NonFieldError';
import routes from '#base/configs/routes';
import { hCaptchaKey } from '#base/configs/hCaptcha';
import { termsNotice } from '#utils/terms';
import { useModalState } from '#hooks/stateManagement';
import generateString from '#utils/string';

import _ts from '#ts';

import {
    RegisterMutation,
    RegisterMutationVariables,
    RegisterInputType,
} from '#generated/types';

import styles from './styles.css';

const REGISTER = gql`
    mutation Register($input: RegisterInputType!) {
        register(data: $input) {
            captchaRequired
            errors
            ok
        }
    }
`;

type FormType = Partial<RegisterInputType>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: [emailCondition, requiredStringCondition],
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [requiredStringCondition],
        captcha: [requiredStringCondition],
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
    const [termsAccepted, setTermsAccepted] = useState(false);

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
        isTermsModalShown, ,
        setTermsModalHidden, ,
        toggleTermsModal,
    ] = useModalState(false);

    const [
        triggerRegister,
        { loading: registerPending },
    ] = useMutation<RegisterMutation, RegisterMutationVariables>(
        REGISTER,
        {
            onCompleted: (response) => {
                const { register: registerRes } = response;
                if (!registerRes) {
                    return;
                }
                const {
                    errors,
                    ok,
                } = registerRes;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                } else if (ok) {
                    setSuccess(true);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const handleAcceptTerms = useCallback(() => {
        setTermsAccepted(true);
        setTermsModalHidden();
    }, [setTermsModalHidden]);

    const handleCancelTerms = useCallback(() => {
        setTermsAccepted(false);
        setTermsModalHidden();
    }, [setTermsModalHidden]);

    const handleSubmit = useCallback((finalValue: FormType) => {
        elementRef.current?.resetCaptcha();
        triggerRegister({ variables: { input: finalValue as RegisterInputType } });
    }, [triggerRegister]);

    return (
        <>
            <form
                className={_cs(styles.registerForm, className)}
                onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
            >
                {registerPending && <PendingMessage />}
                <Container
                    className={styles.registerFormContainer}
                    contentClassName={styles.inputContainer}
                    heading="Register"
                    headingSize="medium"
                    headingDescription={(
                        <div className={styles.headingDescription}>
                            <span>
                                Already a user?
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
                        <div className={styles.registerSuccess}>
                            {_ts('explore.register', 'checkYourEmailText', { email: value?.email })}
                        </div>
                    ) : (
                        <>
                            <NonFieldError error={error} />
                            <TextInput
                                name="firstName"
                                onChange={setFieldValue}
                                value={value?.firstName}
                                error={error?.firstName}
                                placeholder={_ts('explore.register', 'firstNamePlaceholder')}
                                disabled={registerPending}
                            />
                            <TextInput
                                name="lastName"
                                onChange={setFieldValue}
                                value={value?.lastName}
                                error={error?.lastName}
                                placeholder={_ts('explore.register', 'lastNamePlaceholder')}
                                disabled={registerPending}
                            />
                            <TextInput
                                name="organization"
                                onChange={setFieldValue}
                                value={value?.organization}
                                error={error?.organization}
                                placeholder={_ts('explore.register', 'organizationPlaceholder')}
                                disabled={registerPending}
                            />
                            <TextInput
                                name="email"
                                onChange={setFieldValue}
                                value={value?.email}
                                error={error?.email}
                                placeholder={_ts('explore.register', 'emailPlaceholder')}
                                disabled={registerPending}
                            />
                            <HCaptcha
                                name="captcha"
                                elementRef={elementRef}
                                siteKey={hCaptchaKey}
                                onChange={setFieldValue}
                                error={error?.captcha}
                                disabled={registerPending}
                            />
                            <Checkbox
                                name="terms"
                                label={generateString(
                                    'I accept the {termsButton}',
                                    {
                                        termsButton: (
                                            <Button
                                                name={undefined}
                                                variant="action"
                                                onClick={toggleTermsModal}
                                                className={styles.termsButton}
                                            >
                                                terms of use.
                                            </Button>
                                        ),
                                    },
                                )}
                                value={termsAccepted}
                                onChange={setTermsAccepted}
                            />
                            <Button
                                disabled={registerPending || pristine || !termsAccepted}
                                type="submit"
                                variant="primary"
                                name="register"
                            >
                                {_ts('explore.register', 'registerButtonLabel')}
                            </Button>
                        </>
                    )}
                </Container>
                <Kraken
                    className={styles.kraken}
                    variant="ballon"
                    size="extraLarge"
                />
            </form>
            {isTermsModalShown && (
                <Modal
                    onCloseButtonClick={setTermsModalHidden}
                    size="large"
                    heading="DEEP Terms of Use and Privacy Notice"
                    footerActions={(
                        <>
                            <Button
                                name={undefined}
                                onClick={handleCancelTerms}
                                variant="secondary"
                            >
                                Reject
                            </Button>
                            <Button
                                name={undefined}
                                onClick={handleAcceptTerms}
                                variant="primary"
                            >
                                Accept
                            </Button>
                        </>
                    )}
                >
                    <ReactMarkdown className={styles.termsContent}>
                        {termsNotice}
                    </ReactMarkdown>
                </Modal>
            )}
        </>
    );
}

export default RegisterModal;
