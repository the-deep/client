/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { FgRestBuilder } from '#rsu/rest';
import { reverseRoute } from '@togglecorp/fujs';
import LoadingAnimation from '#rscv/LoadingAnimation';
import NonFieldErrors from '#rsci/NonFieldErrors';
import ReCaptcha from '#rsci/ReCaptcha';
import TextInput from '#rsci/TextInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Faram, {
    requiredCondition,
    emailCondition,
} from '#rscg/Faram';

import _ts from '#ts';
import {
    alterResponseErrorToFaramError,
    createParamsForUserPasswordReset,
    urlForUserPasswordReset,
} from '#rest';
import { pathNames } from '#constants';
import { reCaptchaSiteKey } from '#config/reCaptcha';
import schema from '#schema';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = { };

export default class PasswordReset extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            resetSuccess: false,
        };

        this.schema = {
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
    }

    setResetRecaptchaFunction = (func) => {
        this.resetRecaptcha = func;
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (_, { email, recaptchaResponse }) => {
        const url = urlForUserPasswordReset;
        const params = createParamsForUserPasswordReset({ email, recaptchaResponse });
        this.passwordReset({ url, params });
    };

    // LOGIN ACTION

    passwordReset = ({ url, params }) => {
        // Stop any retry action
        if (this.userPasswordRestRequest) {
            this.userPasswordRestRequest.stop();
        }
        this.userPasswordRestRequest = this.createRequestPasswordReset(url, params);

        this.userPasswordRestRequest.start();
    };

    // LOGIN REST API

    createRequestPasswordReset = (url, params) => {
        const userPasswordRestRequest = new FgRestBuilder()
            .url(url)
            .params(params)
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                if (this.resetRecaptcha) {
                    this.resetRecaptcha();
                }
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPasswordResetResponse');
                    this.setState({ resetSuccess: true });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                if (response.errorCode === 4004) {
                    this.setState({
                        faramErrors: {
                            ...faramErrors,
                            $internal: [_ts('passwordReset', 'retryRecaptcha')],
                        },
                    });
                } else {
                    this.setState({ faramErrors });
                }
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    faramErrors: { $internal: [_ts('passwordReset', 'passwordResetError')] },
                });
            })
            .build();
        return userPasswordRestRequest;
    }

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            resetSuccess,
        } = this.state;

        return (
            <div className={styles.resetPassword}>
                <div className={styles.formContainer}>
                    {
                        resetSuccess ? (
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
                                onChange={this.handleFaramChange}
                                onValidationFailure={this.handleFaramValidationFailure}
                                onValidationSuccess={this.handleFaramValidationSuccess}
                                schema={this.schema}
                                value={faramValues}
                                error={faramErrors}
                                disabled={pending}
                            >
                                { pending && <LoadingAnimation /> }
                                <NonFieldErrors faramElement />
                                <TextInput
                                    faramElementName="email"
                                    label={_ts('passwordReset', 'emailLabel')}
                                    placeholder={_ts('passwordReset', 'emailPlaceholder')}
                                />
                                <ReCaptcha
                                    setResetFunction={this.setResetRecaptchaFunction}
                                    faramElementName="recaptchaResponse"
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
}
