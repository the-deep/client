import React, { useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import { IoChevronForwardSharp } from 'react-icons/io5';
import { generatePath } from 'react-router-dom';
import {
    Link,
    Kraken,
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

import SmartLink from '#base/components/SmartLink';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import { parseUrlParams } from '#utils/common';
import { UserContext } from '#base/context/UserContext';
import { ProjectContext } from '#base/context/ProjectContext';
import HCaptcha from '#components/HCaptcha';
import { hidUrl } from '#base/configs/hid';
import NonFieldError from '#components/NonFieldError';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import routes from '#base/configs/routes';
import { LAST_ACTIVE_PROJECT_FRAGMENT } from '#gqlFragments';

import _ts from '#ts';
import {
    LoginMutation,
    LoginMutationVariables,
    LoginWithHidMutation,
    LoginWithHidMutationVariables,
} from '#generated/types';
import { hCaptchaKey } from '#base/configs/hCaptcha';

import styles from './styles.css';

interface HidQuery {

    access_token: string;

    expires_in: number;
    state: number;

    token_type: string;
}

interface LoginFields {
    // NOTE: Email must be sent as email
    email: string;
    password: string;
    captcha?: string;
}

const LOGIN = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    mutation Login($input: LoginInputType!) {
        login(data: $input) {
            result {
                email
                id
                displayName
                displayPictureUrl
                accessibleFeatures {
                    key
                }
                lastActiveProject {
                    ...LastActiveProjectResponse
                }
            }
            captchaRequired
            errors
            ok
        }
    }
`;

const LOGIN_WITH_HID = gql`
    ${LAST_ACTIVE_PROJECT_FRAGMENT}
    mutation LoginWithHid($input: HIDLoginInputType!) {
        loginWithHid(data: $input) {
            result {
                email
                id
                displayName
                displayPictureUrl
                accessibleFeatures {
                    key
                }
                lastActiveProject {
                    ...LastActiveProjectResponse
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

    const handleSubmit = useCallback((finalValue: FormType) => {
        elementRef.current?.resetCaptcha();
        login({
            variables: {
                input: finalValue as LoginMutationVariables['input'],
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
                <SmartButtonLikeLink
                    className={styles.forgetPasswordButton}
                    route={routes.forgotPassword}
                    state={{ email: value?.email }}
                    variant="action"
                    actions={(
                        <IoChevronForwardSharp />
                    )}
                >
                    {_ts('explore.login', 'forgotPasswordButtonLabel')}
                </SmartButtonLikeLink>
                {captchaRequired && (
                    <HCaptcha
                        name="captcha"
                        elementRef={elementRef}
                        siteKey={hCaptchaKey}
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
            <div className={styles.rightContent}>
                <Kraken
                    className={styles.kraken}
                    variant="skydive"
                    size="large"
                />
                <SmartLink
                    className={styles.link}
                    route={routes.termsOfService}
                >
                    Terms and Privacy
                </SmartLink>
            </div>
        </form>
    );
}

export default LoginForm;
