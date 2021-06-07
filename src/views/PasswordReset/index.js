import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Faram, {
    requiredCondition,
    emailCondition,
} from '@togglecorp/faram';
import { reverseRoute } from '@togglecorp/fujs';

import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ReCaptcha from '#rsci/ReCaptcha';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';
import { pathNames } from '#constants';
import { reCaptchaSiteKey } from '#config/reCaptcha';
import { useLazyRequest } from '#utils/request';

import styles from './styles.scss';

const faramSchema = {
    fields: {
        email: [
            requiredCondition,
            emailCondition,
        ],
        recaptchaResponse: [
            requiredCondition,
        ],
    },
};

function PasswordReset() {
    const [faramValues, setFaramValues] = useState({});
    const [faramErrors, setFaramErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const recaptchaRef = useRef(null);

    const {
        pending: resetPending,
        trigger: triggerReset,
    } = useLazyRequest({
        url: 'server://password/reset/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            setSuccess(true);
            if (recaptchaRef.current && recaptchaRef.current.reset) {
                recaptchaRef.current.reset();
            }
        },
        onFailure: ({ value: { errorCode, faramErrors: newFaramErrors } }) => {
            if (recaptchaRef.current && recaptchaRef.current.reset) {
                recaptchaRef.current.reset();
            }
            if (errorCode === 4004) {
                setFaramErrors({
                    ...newFaramErrors,
                    $internal: [
                        _ts('passwordReset', 'retryRecaptcha'),
                    ],
                });
            } else {
                setFaramErrors(newFaramErrors);
            }
        },
        schemaName: 'userPasswordResetResponse',
    });

    const handleFaramChange = useCallback((newFaramValues, newFaramErrors) => {
        setFaramValues(newFaramValues);
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationFailure = useCallback((newFaramErrors) => {
        setFaramErrors(newFaramErrors);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, finalValues) => {
        triggerReset({
            email: finalValues.email,
            recaptchaResponse: finalValues.recaptchaResponse,
        });
    }, [triggerReset]);

    return (
        <div className={styles.resetPassword}>
            <div className={styles.formContainer}>
                {
                    success ? (
                        <div className={styles.info}>
                            <p>
                                {
                                    _ts('passwordReset', 'checkInboxText', { email: faramValues.email })
                                }
                            </p>
                        </div>
                    ) : (
                        <Faram
                            className={styles.resetPasswordForm}
                            onChange={handleFaramChange}
                            onValidationFailure={handleFaramValidationFailure}
                            onValidationSuccess={handleFaramValidationSuccess}
                            schema={faramSchema}
                            value={faramValues}
                            error={faramErrors}
                            disabled={resetPending}
                        >
                            { resetPending && <LoadingAnimation /> }
                            <NonFieldErrors faramElement />
                            <TextInput
                                faramElementName="email"
                                label={_ts('passwordReset', 'emailLabel')}
                                placeholder={_ts('passwordReset', 'emailPlaceholder')}
                            />
                            <ReCaptcha
                                faramElementName="recaptchaResponse"
                                componentRef={recaptchaRef}
                                siteKey={reCaptchaSiteKey}
                            />
                            <div className={styles.actionButtons}>
                                <PrimaryButton type="submit">
                                    { _ts('passwordReset', 'submitForgetPassword') }
                                </PrimaryButton>
                            </div>
                        </Faram>
                    )
                }
                <div className={styles.goBackContainer}>
                    <Link
                        className={styles.goBackLink}
                        to={reverseRoute(pathNames.login, {})}
                    >
                        {_ts('passwordReset', 'goBackToLoginText')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PasswordReset;
