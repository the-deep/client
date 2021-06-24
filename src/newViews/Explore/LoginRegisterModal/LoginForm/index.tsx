import React, { useState, useRef, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
    TextInput,
    Button,
    Container,
    PasswordInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    requiredCondition,
    emailCondition,
    createSubmitHandler,
    lengthGreaterThanCondition,
    requiredStringCondition,
    lengthSmallerThanCondition,
} from '@togglecorp/toggle-form';
import Captcha from '@hcaptcha/react-hcaptcha';

import { useLazyRequest } from '#utils/request';
import HCaptcha from '#components/ui/HCaptcha';

import {
    loginAction,
    authenticateAction,
} from '#redux';
import { startSiloBackgroundTasksAction } from '#redux/middlewares/siloBackgroundTasks';
import _ts from '#ts';

import styles from './styles.scss';

const HCaptchaSitekey = process.env.REACT_APP_HCATPCHA_SITEKEY as string;

interface LoginFields {
    // NOTE: Email must be sent as username
    username: string;
    password: string;
    hcaptcha_response?: string;
}

type FormType = Partial<LoginFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema = (captchaRequired: boolean): FormSchema => ({
    fields: (): FormSchemaFields => {
        let basicFields: FormSchemaFields = {
            username: [emailCondition, requiredCondition],
            password: [
                requiredCondition,
                lengthGreaterThanCondition(4),
                lengthSmallerThanCondition(129),
            ],
        };
        if (captchaRequired) {
            basicFields = {
                ...basicFields,
                hcaptcha_response: [requiredStringCondition],
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
}

function LoginRegisterModal(props: Props & PropsFromDispatch) {
    const {
        className,
        login,
        authenticate,
        startSiloTasks,
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
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(initialValue, mySchema);

    const {
        trigger: loginTrigger,
    } = useLazyRequest({
        url: 'server://token/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: (response) => {
            // const { refresh, access } = response;
            console.warn('here', response, login, authenticate, startSiloTasks);
            // login({ refresh, access });
            // startSiloTasks(() => console.log('Silo tasks started'));
            // authenticate();
            // if (recaptchaRef.current && recaptchaRef.current.reset) {
            //     recaptchaRef.current.reset();
            // }
        },
        onFailure: (response) => {
            if (response.errorCode === 4004) {
                /*
                setFaramErrors({
                    ...newFaramErrors,
                    $internal: [
                        showReCaptcha
                            ? _ts('login', 'retryRecaptcha')
                            : _ts('login', 'enterRecaptcha'),
                    ],
                });
                 */
                setCaptchaRequired(true);
            } else {
                // setFaramErrors(newFaramErrors);
                // setPending(false);
            }
        },
        schemaName: 'tokenGetResponse',
    });

    const handleSubmit = useCallback((finalValue) => {
        loginTrigger(finalValue);
    }, [loginTrigger]);

    return (
        <form
            className={_cs(styles.loginForm, className)}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
                className={styles.loginFormContainer}
                contentClassName={styles.inputContainer}
                footerActions={(
                    <div className={styles.loginButton}>
                        <Button
                            className={styles.button}
                            disabled={pristine}
                            type="submit"
                            variant="primary"
                            name="login"
                        >
                            {_ts('explore.login', 'loginButtonLabel')}
                        </Button>
                        {_ts('explore.login', 'or')}
                        <Button
                            disabled={pristine}
                            className={styles.button}
                            variant="secondary"
                            name="loginWithHid"
                        >
                            {_ts('explore.login', 'loginWithHid')}
                        </Button>
                    </div>
                )}
            >
                <TextInput
                    name="username"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.username}
                    error={error?.fields?.username}
                    label={_ts('explore.login', 'emailLabel')}
                    placeholder={_ts('myProfile', 'emailPlaceholder')}
                    autoFocus
                />
                <PasswordInput
                    name="password"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.password}
                    error={error?.fields?.password}
                    label={_ts('explore.login', 'password')}
                    placeholder={_ts('explore.login', 'password')}
                />
                {captchaRequired && (
                    <HCaptcha
                        name="hcaptcha_response"
                        elementRef={elementRef}
                        siteKey={HCaptchaSitekey}
                        // value={value.captcha}
                        onChange={onValueChange}
                        error={error?.fields?.hcaptcha_response}
                    />
                )}

            </Container>
        </form>
    );
}

export default connect(undefined, mapDispatchToProps)(LoginRegisterModal);
