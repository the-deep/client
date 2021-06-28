import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

import Faram, {
    FaramInputElement,
    emailCondition,
    requiredCondition,
} from '@togglecorp/faram';
import { reverseRoute } from '@togglecorp/fujs';

import NewHCaptcha from '#components/ui/HCaptcha';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';

import { useLazyRequest } from '#utils/request';
import { pathNames } from '#constants';
import _ts from '#ts';

import styles from './styles.scss';

const HCaptcha = FaramInputElement(NewHCaptcha);
const HCaptchaSitekey = process.env.REACT_APP_HCATPCHA_SITEKEY;

const faramSchema = {
    fields: {
        firstname: [requiredCondition],
        lastname: [requiredCondition],
        organization: [requiredCondition],
        email: [
            requiredCondition,
            emailCondition,
        ],
        hcaptchaResponse: [requiredCondition],
    },
};

function Register() {
    const [faramValues, setFaramValues] = useState({});
    const [faramErrors, setFaramErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const elementRef = useRef(null);

    const {
        pending: registerPending,
        trigger: triggerRegister,
        context,
    } = useLazyRequest({
        url: 'server://users/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            setSuccess(true);
        },
        onFailure: ({ errorCode, value: { faramErrors: newFaramErrors } }) => {
            if (errorCode === 4004) {
                setFaramErrors({
                    ...newFaramErrors,
                    $internal: [
                        _ts('register', 'retryRecaptcha'),
                    ],
                });
            } else {
                setFaramErrors({
                    ...newFaramErrors,
                    email: newFaramErrors.username,
                });
            }
        },
        schemaName: 'userCreateResponse',
    });

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((finalValues) => {
        elementRef.current?.resetCaptcha();
        triggerRegister({
            ...finalValues,
            // NOTE: username of the user is their email address
            username: finalValues.email,
        });
    }, [triggerRegister]);

    return (
        <div className={styles.register}>
            <div className={styles.registerBox}>
                { success ? (
                    <div className={styles.registerSuccess}>
                        {_ts('register', 'checkYourEmailText', { email: context?.email })}
                    </div>
                ) : (
                    <Faram
                        className={styles.registerForm}
                        onChange={handleFaramChange}
                        onValidationFailure={handleFaramValidationFailure}
                        onValidationSuccess={handleFaramValidationSuccess}
                        schema={faramSchema}
                        value={faramValues}
                        error={faramErrors}
                        disabled={registerPending}
                    >
                        <NonFieldErrors faramElement />
                        <TextInput
                            faramElementName="firstname"
                            label={_ts('register', 'firstNameLabel')}
                            placeholder={_ts('register', 'firstNamePlaceholder')}
                            autoFocus
                        />
                        <TextInput
                            faramElementName="lastname"
                            label={_ts('register', 'lastNameLabel')}
                            placeholder={_ts('register', 'lastNamePlaceholder')}
                        />
                        <TextInput
                            faramElementName="organization"
                            label={_ts('register', 'organizationLabel')}
                            placeholder={_ts('register', 'organizationPlaceholder')}
                        />
                        <TextInput
                            faramElementName="email"
                            label={_ts('register', 'emailLabel')}
                            placeholder={_ts('register', 'emailPlaceholder')}
                        />
                        <HCaptcha
                            elementRef={elementRef}
                            faramElementName="hcaptchaResponse"
                            siteKey={HCaptchaSitekey}
                        />
                        <div className={styles.actionButtons}>
                            <PrimaryButton
                                type="submit"
                                pending={registerPending}
                            >
                                { _ts('register', 'registerLabel')}
                            </PrimaryButton>
                        </div>
                    </Faram>
                )}
                <div className={styles.loginLinkContainer}>
                    <p>
                        { success ?
                            _ts('register', 'goBackToLoginText') :
                            _ts('register', 'alreadyHaveAccountText')
                        }
                    </p>
                    <Link
                        to={reverseRoute(pathNames.login, {})}
                        className={styles.loginLink}
                    >
                        {_ts('register', 'loginLabel')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
