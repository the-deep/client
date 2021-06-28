import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Faram, {
    FaramInputElement,
    requiredCondition,
    emailCondition,
} from '@togglecorp/faram';
import { reverseRoute } from '@togglecorp/fujs';

import NewHCaptcha from '#components/ui/HCaptcha';
import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';

import _ts from '#ts';
import { pathNames } from '#constants';
import { useLazyRequest } from '#utils/request';

import styles from './styles.scss';

const HCaptcha = FaramInputElement(NewHCaptcha);
const HCaptchaSitekey = process.env.REACT_APP_HCATPCHA_SITEKEY;

const faramSchema = {
    fields: {
        email: [
            requiredCondition,
            emailCondition,
        ],
        hcaptchaResponse: [
            requiredCondition,
        ],
    },
};

function PasswordReset() {
    const [faramValues, setFaramValues] = useState({});
    const [faramErrors, setFaramErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const captchaRef = useRef(null);

    const {
        pending: resetPending,
        trigger: triggerReset,
    } = useLazyRequest({
        url: 'server://password/reset/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            setSuccess(true);
        },
        onFailure: ({ value: { errorCode, faramErrors: newFaramErrors } }) => {
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
        captchaRef.current?.resetCaptcha();
        triggerReset({
            email: finalValues.email,
            hcaptchaResponse: finalValues.hcaptchaResponse,
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
                            <HCaptcha
                                elementRef={captchaRef}
                                faramElementName="hcaptchaResponse"
                                siteKey={HCaptchaSitekey}
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
