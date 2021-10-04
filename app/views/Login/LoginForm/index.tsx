import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import { IoChevronForwardSharp } from 'react-icons/io5';
import { generatePath } from 'react-router-dom';
import {
    Link,
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
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import routes from '#base/configs/routes';
import flyingKraken from '#resources/img/flying-kraken.png';

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
                    hasAssessmentTemplate
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
                    hasAssessmentTemplate
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
}

function LoginForm(props: Props) {
    const {
        className,
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
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
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
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
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

    const forgotPasswordLink = useMemo(() => ({
        pathname: generatePath(routes.forgotPassword.path, {}),
        state: { email: value?.email },
    }), [value?.email]);

    return (
        <form
            className={_cs(styles.loginForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            {pending && <PendingMessage />}
            <Container
                className={styles.loginFormContainer}
                heading="Login"
                headingSize="medium"
                headingDescription={(
                    <div className={styles.headingDescription}>
                        <span>
                            New to DEEP?
                        </span>
                        <Link
                            to={generatePath(routes.register.path, {})}
                        >
                            Register
                        </Link>
                    </div>
                )}
                contentClassName={styles.inputContainer}
            >
                <NonFieldError error={error} />
                <TextInput
                    name="email"
                    onChange={setFieldValue}
                    value={value?.email}
                    error={error?.email}
                    placeholder={_ts('explore.login', 'emailPlaceholder')}
                    disabled={pending}
                    autoFocus
                />
                <PasswordInput
                    name="password"
                    onChange={setFieldValue}
                    value={value?.password}
                    error={error?.password}
                    placeholder={_ts('explore.login', 'password')}
                    disabled={pending}
                />
                <ButtonLikeLink
                    className={styles.forgetPasswordButton}
                    to={forgotPasswordLink}
                    variant="action"
                    actions={(
                        <IoChevronForwardSharp />
                    )}
                >
                    {_ts('explore.login', 'forgotPasswordButtonLabel')}
                </ButtonLikeLink>
                {captchaRequired && (
                    <HCaptcha
                        name="captcha"
                        elementRef={elementRef}
                        siteKey={HCaptchaSiteKey}
                        onChange={setFieldValue}
                        error={error?.captcha}
                    />
                )}
                <Button
                    disabled={pristine || pending}
                    type="submit"
                    variant="primary"
                    name="login"
                >
                    {_ts('explore.login', 'loginButtonLabel')}
                </Button>
                <ButtonLikeLink
                    disabled={pristine || pending}
                    variant="secondary"
                    to={hidUrl}
                >
                    {_ts('explore.login', 'loginWithHid')}
                </ButtonLikeLink>
            </Container>
            <img
                alt=""
                className={styles.kraken}
                src={flyingKraken}
            />
        </form>
    );
}

export default LoginForm;
