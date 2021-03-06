import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
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
    ObjectSchema,
    useForm,
    emailCondition,
    createSubmitHandler,
    lengthGreaterThanCondition,
    requiredStringCondition,
    lengthSmallerThanCondition,
    internal,
    getErrorObject,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';
import { parseUrlParams } from '@togglecorp/react-rest-request';

import { useLazyRequest } from '#utils/request';
import HCaptcha from '#newComponents/ui/HCaptcha';
import { hidUrl } from '#config/hid';
import NonFieldError from '#newComponents/ui/NonFieldError';

import {
    loginAction,
    authenticateAction,
} from '#redux';
import { startSiloBackgroundTasksAction } from '#redux/middlewares/siloBackgroundTasks';
import _ts from '#ts';
import HCaptchaSiteKey from '#config/hCaptcha';

import styles from './styles.scss';

interface HidQuery {
    // eslint-disable-next-line camelcase
    access_token: string;
    // eslint-disable-next-line camelcase
    expires_in: string;
    state: string;
    // eslint-disable-next-line camelcase
    token_type: string;
}

interface HidParams {
    accessToken: string;
    expiresIn: string;
    state: string;
    tokenType: string;
}

interface LoginResponse {
    access: string;
    refresh: string;
}

interface LoginFields {
    // NOTE: Email must be sent as username
    username: string;
    password: string;
    hcaptchaResponse?: string;
}

type FormType = Partial<LoginFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema = (captchaRequired: boolean): FormSchema => ({
    fields: (): FormSchemaFields => {
        let basicFields: FormSchemaFields = {
            username: [emailCondition, requiredStringCondition],
            password: [
                requiredStringCondition,
                lengthGreaterThanCondition(4),
                lengthSmallerThanCondition(129),
            ],
        };
        if (captchaRequired) {
            basicFields = {
                ...basicFields,
                hcaptchaResponse: [requiredStringCondition],
            };
        }
        return basicFields;
    },
});


const initialValue: FormType = {};

interface PropsFromDispatch {
    login: typeof loginAction;
    authenticate: typeof authenticateAction;
    startSiloTasks: typeof startSiloBackgroundTasksAction;
}

const mapDispatchToProps = (dispatch: Dispatch): PropsFromDispatch => ({
    authenticate: () => dispatch(authenticateAction()),
    login: params => dispatch(loginAction(params)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
});

interface Props {
    className?: string;
    location: Location;
    onForgotPasswordClick: (email?: string) => void;
}

function LoginRegisterModal(props: Props & PropsFromDispatch) {
    const {
        className,
        login,
        authenticate,
        startSiloTasks,
        location,
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

    const {
        pending: loginPending,
        trigger: loginTrigger,
    } = useLazyRequest<LoginResponse, LoginFields>({
        url: 'server://token/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: ({ refresh, access }) => {
            login({ refresh, access });
            startSiloTasks(() => console.log('Silo tasks started'));
            authenticate();
        },
        onFailure: ({ errorCode, value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;
            if (errorCode === 4004) {
                setError({
                    ...otherErrors,
                    [internal]: captchaRequired
                        ? _ts('explore.login', 'retryRecaptcha')
                        : _ts('explore.login', 'enterRecaptcha'),
                });
                setCaptchaRequired(true);
            } else {
                setError({
                    ...otherErrors,
                    [internal]: $internal,
                });
            }
        },
        schemaName: 'tokenGetResponse',
    });

    const {
        pending: hidLoginPending,
        trigger: hidLoginTrigger,
    } = useLazyRequest<LoginResponse, HidParams>({
        url: 'server://token/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: ({ refresh, access }) => {
            login({ refresh, access });
            startSiloTasks(() => console.log('Silo tasks started'));
            authenticate();
        },
        onFailure: ({ errorCode, value: errorValue }) => {
            const {
                $internal,
                ...otherErrors
            } = errorValue.faramErrors;
            if (errorCode === 4004) {
                setError({
                    ...otherErrors,
                    [internal]: captchaRequired
                        ? _ts('explore.login', 'retryRecaptcha')
                        : _ts('explore.login', 'enterRecaptcha'),
                });
                setCaptchaRequired(true);
            } else {
                setError({
                    ...otherErrors,
                    [internal]: $internal,
                });
            }
        },
        schemaName: 'tokenGetResponse',
    });

    useEffect(() => {
        // Get params from the current url
        // NOTE: hid provides query as hash
        // eslint-disable-next-line camelcase
        const query = parseUrlParams(location?.hash?.replace('#', '')) as { access_token?: string };
        // Login User with HID access_token
        if (query.access_token) {
            const hidQuery = query as HidQuery;
            const params = {
                accessToken: hidQuery.access_token,
                expiresIn: hidQuery.expires_in,
                state: hidQuery.state,
                tokenType: hidQuery.token_type,
            };
            hidLoginTrigger(params);
        }
    }, [hidLoginTrigger, location]);

    const handleSubmit = useCallback((finalValue) => {
        elementRef.current?.resetCaptcha();
        loginTrigger(finalValue);
    }, [loginTrigger]);

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
                        name="hcaptchaResponse"
                        elementRef={elementRef}
                        siteKey={HCaptchaSiteKey}
                        onChange={setFieldValue}
                        error={error?.hcaptchaResponse}
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
                        name="username"
                        className={styles.input}
                        onChange={setFieldValue}
                        value={value?.username}
                        error={error?.username}
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
                    name={value?.username}
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

export default connect(undefined, mapDispatchToProps)(LoginRegisterModal);
