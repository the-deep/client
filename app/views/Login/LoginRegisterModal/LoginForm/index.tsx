import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import { IoChevronForwardSharp } from 'react-icons/io5';
import {
    TextInput,
    Button,
    Container,
    PasswordInput,
    PendingMessage,
    ButtonLikeLink,
} from '@the-deep/deep-ui';
import {
    internal,
    ObjectSchema,
    useForm,
    emailCondition,
    removeNull,
    createSubmitHandler,
    lengthGreaterThanCondition,
    requiredStringCondition,
    lengthSmallerThanCondition,
    getErrorObject,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';

import { parseUrlParams } from '#utils/common';
import { UserContext } from '#base/context/UserContext';
import { ProjectContext } from '#base/context/ProjectContext';
import HCaptcha from '#components/HCaptcha';
import { hidUrl } from '#base/configs/hid';
import NonFieldError from '#components/NonFieldError';
import { transformToFormError } from '#base/utils/errorTransform';

import _ts from '#ts';
import {
    LoginMutation,
    LoginMutationVariables,
    LoginWithHidMutation,
    LoginWithHidMutationVariables,
} from '#generated/types';
import HCaptchaSiteKey from '#base/configs/hCaptcha';

import styles from './styles.css';

interface HidQuery {
    // eslint-disable-next-line camelcase
    access_token: string;
    // eslint-disable-next-line camelcase
    expires_in: number;
    state: number;
    // eslint-disable-next-line camelcase
    token_type: string;
}

interface LoginFields {
    // NOTE: Email must be sent as email
    email: string;
    password: string;
    captcha?: string;
}

const LOGIN = gql`
    mutation Login($input: LoginInputType!) {
        login(data: $input) {
            result {
                email
                id
                displayName
                displayPictureUrl
                lastActiveProject {
                    allowedPermissions
                    currentUserRole
                    id
                    isPrivate
                    title
                }
            }
            captchaRequired
            errors
            ok
        }
    }
`;

const LOGIN_WITH_HID = gql`
    mutation LoginWithHid($input: HIDLoginInputType!) {
        loginWithHid(data: $input) {
            result {
                email
                id
                displayName
                displayPictureUrl
                lastActiveProject {
                    allowedPermissions
                    currentUserRole
                    id
                    isPrivate
                    title
                }
            }
            errors
            ok
        }
    }
`;

type FormType = Partial<LoginFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema = (captchaRequired: boolean): FormSchema => ({
    fields: (): FormSchemaFields => {
        let basicFields: FormSchemaFields = {
            email: [emailCondition, requiredStringCondition],
            password: [
                requiredStringCondition,
                lengthGreaterThanCondition(4),
                lengthSmallerThanCondition(129),
            ],
        };
        if (captchaRequired) {
            basicFields = {
                ...basicFields,
                captcha: [requiredStringCondition],
            };
        }
        return basicFields;
    },
});

const initialValue: FormType = {};

interface Props {
    className?: string;
    onForgotPasswordClick: (email?: string) => void;
}

function LoginRegisterModal(props: Props) {
    const {
        className,
        onForgotPasswordClick,
    } = props;

    const [captchaRequired, setCaptchaRequired] = useState(false);

    const elementRef = useRef<Captcha>(null);

    const mySchema = useMemo(
        () => schema(captchaRequired),
        [captchaRequired],
    );

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(mySchema, initialValue);

    const error = getErrorObject(riskyError);
    const { setUser } = useContext(UserContext);
    const { setProject } = useContext(ProjectContext);

    const [
        login,
        { loading: loginPending },
    ] = useMutation<LoginMutation, LoginMutationVariables>(
        LOGIN,
        {
            onCompleted: (response) => {
                const { login: loginRes } = response;
                if (!loginRes) {
                    return;
                }
                const {
                    errors,
                    result,
                    captchaRequired: captchaRequiredFromResponse,
                    ok,
                } = loginRes;

                setCaptchaRequired(captchaRequiredFromResponse);

                if (errors) {
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok) {
                    const safeUser = removeNull(result);
                    setUser(safeUser);
                    setProject(safeUser.lastActiveProject);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const [
        loginWithHid,
        { loading: hidLoginPending },
    ] = useMutation<LoginWithHidMutation, LoginWithHidMutationVariables>(
        LOGIN_WITH_HID,
        {
            onCompleted: (response) => {
                const { loginWithHid: loginRes } = response;
                if (!loginRes) {
                    return;
                }
                const {
                    errors,
                    result,
                    ok,
                } = loginRes;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors));
                    setError(formError);
                } else if (ok) {
                    const safeUser = removeNull(result);
                    setUser(safeUser);
                    setProject(safeUser.lastActiveProject);
                }
            },
            onError: (errors) => {
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    useEffect(() => {
        // Get params from the current url
        // NOTE: hid provides query as hash
        // eslint-disable-next-line camelcase
        const query = parseUrlParams(window.location?.hash?.replace('#', '')) as { access_token?: string };
        // Login User with HID access_token
        if (query.access_token) {
            const hidQuery = query as HidQuery;
            const params = {
                accessToken: hidQuery.access_token,
                expiresIn: hidQuery.expires_in,
                state: hidQuery.state,
                tokenType: hidQuery.token_type,
            };
            loginWithHid({
                variables: {
                    input: params,
                },
            });
        }
    }, [loginWithHid]);

    const handleSubmit = useCallback((finalValue) => {
        elementRef.current?.resetCaptcha();
        login({
            variables: {
                input: finalValue,
            },
        });
    }, [login]);

    const pending = hidLoginPending || loginPending;

    return (
        <form
            className={_cs(styles.loginForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            {pending && <PendingMessage />}
            <Container
                className={styles.loginFormContainer}
                contentClassName={styles.content}
                footerContent={captchaRequired && (
                    <HCaptcha
                        className={styles.captcha}
                        name="captcha"
                        elementRef={elementRef}
                        siteKey={HCaptchaSiteKey}
                        onChange={setFieldValue}
                        error={error?.captcha}
                    />
                )}
                footerActions={(
                    <div className={styles.loginButton}>
                        <Button
                            className={styles.button}
                            disabled={pristine || pending}
                            type="submit"
                            variant="primary"
                            name="login"
                        >
                            {_ts('explore.login', 'loginButtonLabel')}
                        </Button>
                        {_ts('explore.login', 'or')}
                        <ButtonLikeLink
                            disabled={pristine || pending}
                            className={styles.button}
                            variant="secondary"
                            to={hidUrl}
                        >
                            {_ts('explore.login', 'loginWithHid')}
                        </ButtonLikeLink>
                    </div>
                )}
            >
                <NonFieldError
                    className={styles.error}
                    error={error}
                />
                <div className={styles.inputContainer}>
                    <TextInput
                        name="email"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.email}
                        error={error?.email}
                        label={_ts('explore.login', 'emailLabel')}
                        placeholder={_ts('explore.login', 'emailPlaceholder')}
                        disabled={pending}
                        autoFocus
                    />
                    <PasswordInput
                        name="password"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.password}
                        error={error?.password}
                        label={_ts('explore.login', 'password')}
                        placeholder={_ts('explore.login', 'password')}
                        disabled={pending}
                    />
                </div>
                <Button
                    className={styles.forgetPasswordButton}
                    name={value?.email}
                    onClick={onForgotPasswordClick}
                    variant="action"
                    actions={(
                        <IoChevronForwardSharp />
                    )}
                >
                    {_ts('explore.login', 'forgotPasswordButtonLabel')}
                </Button>
            </Container>
        </form>
    );
}

export default LoginRegisterModal;
