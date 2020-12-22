import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';
import Faram, {
    requiredCondition,
    emailCondition,
    lengthGreaterThanCondition,
    lengthLessThanCondition,
} from '@togglecorp/faram';
import { parseUrlParams } from '@togglecorp/react-rest-request';

import Icon from '#rscg/Icon';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ReCaptcha from '#rsci/ReCaptcha';
import TextInput from '#rsci/TextInput';
import useRequest from '#utils/request';

import { hidUrl } from '#config/hid';
import { reCaptchaSiteKey } from '#config/reCaptcha';
import { pathNames } from '#constants';
import {
    loginAction,
    authenticateAction,
} from '#redux';
import { startSiloBackgroundTasksAction } from '#redux/middlewares/siloBackgroundTasks';
import _ts from '#ts';

import styles from './styles.scss';

const mapDispatchToProps = dispatch => ({
    authenticate: () => dispatch(authenticateAction()),
    login: params => dispatch(loginAction(params)),
    startSiloTasks: params => dispatch(startSiloBackgroundTasksAction(params)),
});

const schema = {
    fields: {
        email: [
            requiredCondition,
            emailCondition,
        ],
        password: [
            requiredCondition,
            lengthGreaterThanCondition(4),
            lengthLessThanCondition(129),
        ],
    },
};

const schemaWithRecaptcha = {
    fields: {
        email: [
            requiredCondition,
            emailCondition,
        ],
        password: [
            requiredCondition,
            lengthGreaterThanCondition(4),
            lengthLessThanCondition(129),
        ],
        recaptchaResponse: [requiredCondition],
    },
};

function Login(props) {
    const {
        // FIXME: get location value from redux
        login,
        authenticate,
        startSiloTasks,
        location,
    } = props;

    const [faramValues, setFaramValues] = useState({});
    const [faramErrors, setFaramErrors] = useState({});
    const [pending, setPending] = useState(false);
    const [loginUrl, setLoginUrl] = useState(false);
    const [loginBody, setLoginBody] = useState({});
    const [showReCaptcha, setShowReCaptcha] = useState(false);
    const [finalSchema, setFinalSchema] = useState(schema);
    const recaptchaRef = useRef(null);

    const [loginPending, , , loginTrigger] = useRequest({
        url: loginUrl,
        method: 'POST',
        body: loginBody,
        onSuccess: (response) => {
            const { refresh, access } = response;
            login({ refresh, access });
            startSiloTasks(() => console.log('Silo tasks started'));
            authenticate();
            if (recaptchaRef.current && recaptchaRef.current.reset) {
                recaptchaRef.current.reset();
            }
        },
        onFailure: (_, { errorCode, faramErrors: newFaramErrors }) => {
            if (errorCode === 4004) {
                console.warn('i am here');
                setFaramErrors({
                    ...newFaramErrors,
                    $internal: [
                        showReCaptcha ? _ts('login', 'retryRecaptcha') : _ts('login', 'enterRecaptcha'),
                    ],
                });
                setPending(false);
                setShowReCaptcha(true);
                setFinalSchema(schemaWithRecaptcha);
            } else {
                setFaramErrors(newFaramErrors);
                setPending(false);
            }
            if (recaptchaRef.current && recaptchaRef.current.reset) {
                recaptchaRef.current.reset();
            }
        },
        schemaName: 'tokenGetResponse',
    });

    useEffect(() => {
        setPending(loginPending);
    }, [loginPending]);

    const onHidLoginClick = useCallback(() => {
        // Just set it to pending
        // The anchor will redirect user to next page
        setPending(true);
    }, []);

    const checkParamsFromHid = useCallback(() => {
        // Get params from the current url
        // NOTE: hid provides query as hash
        const query = parseUrlParams(location.hash.replace('#', ''));
        // Login User with HID access_token
        if (query.access_token) {
            const params = {
                accessToken: query.access_token,
                expiresIn: query.expires_in,
                state: query.state,
                tokenType: query.token_type,
            };
            setLoginUrl('server://token/hid/');
            setLoginBody(params);
            loginTrigger();
        }
    }, [loginTrigger, location]);

    useEffect(() => {
        checkParamsFromHid();
    }, [checkParamsFromHid]);

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((
        _,
        {
            email,
            password,
            recaptchaResponse,
        },
    ) => {
        const params = {
            username: email,
            password,
            recaptchaResponse,
        };
        setLoginUrl('server://token/');
        setLoginBody(params);
        loginTrigger();
    }, [loginTrigger]);

    return (
        <div className={styles.login}>
            <div className={styles.deepContainer}>
                <Icon
                    className={styles.logo}
                    name="deepLogo"
                />
                <h2 className={styles.heading}>
                    <small>{_ts('login', 'welcomeToText')}</small><br />
                </h2>
            </div>
            <div className={styles.loginFormContainer}>
                <div className={styles.hidLinkContainer}>
                    <a
                        className={styles.hidLink}
                        href={hidUrl}
                        onClick={onHidLoginClick}
                    >
                        <Icon
                            className={styles.logo}
                            name="hidLogo"
                            alt={_ts('login', 'logInWIthHid')}
                            draggable="false"
                        />
                        <span>
                            {_ts('login', 'logInWIthHid')}
                        </span>
                    </a>
                    <div className={styles.orContainer}>
                        <hr />
                        <span className={styles.or}>
                            {_ts('login', 'orText')}
                        </span>
                    </div>
                </div>
                <Faram
                    className={styles.loginForm}
                    onChange={handleFaramChange}
                    onValidationFailure={handleFaramValidationFailure}
                    onValidationSuccess={handleFaramValidationSuccess}
                    schema={finalSchema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    <NonFieldErrors faramElement />
                    <TextInput
                        faramElementName="email"
                        label={_ts('login', 'emailLabel')}
                        placeholder={_ts('login', 'emailPlaceholder')}
                        autoFocus
                    />
                    <TextInput
                        faramElementName="password"
                        label={_ts('login', 'passwordLabel')}
                        placeholder={_ts('login', 'passwordPlaceholder')}
                        type="password"
                    />
                    { showReCaptcha &&
                        <ReCaptcha
                            componentRef={recaptchaRef}
                            faramElementName="recaptchaResponse"
                            siteKey={reCaptchaSiteKey}
                        />
                    }
                    <div className={styles.actionButtons}>
                        <Link
                            className={styles.forgotPasswordLink}
                            to={reverseRoute(pathNames.passwordReset, {})}
                        >
                            {_ts('login', 'forgotPasswordText')}
                        </Link>
                        <PrimaryButton
                            type="submit"
                            pending={pending}
                        >
                            {_ts('login', 'loginLabel')}
                        </PrimaryButton>
                    </div>
                </Faram>
                <div className={styles.registerLinkContainer}>
                    <p>
                        {_ts('login', 'noAccountYetText')}
                    </p>
                    <Link
                        className={styles.registerLink}
                        to={reverseRoute(pathNames.register, {})}
                    >
                        {_ts('login', 'registerLabel')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

Login.propTypes = {
    authenticate: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    login: PropTypes.func.isRequired,
    startSiloTasks: PropTypes.func.isRequired,
};

export default connect(undefined, mapDispatchToProps)(Login);
