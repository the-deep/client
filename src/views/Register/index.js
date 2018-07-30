/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import React from 'react';
import { Link } from 'react-router-dom';

import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import Faram, {
    emailCondition,
    requiredCondition,
} from '#rs/components/Input/Faram';
import NonFieldErrors from '#rs/components/Input/NonFieldErrors';
import ReCaptcha from '#rs/components/Input/ReCaptcha';
import TextInput from '#rs/components/Input/TextInput';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import { reverseRoute } from '#rsu/common';
import { FgRestBuilder } from '#rsu/rest';

import { reCaptchaSiteKey } from '#config/reCaptcha';
import { pathNames } from '#constants';
import schema from '#schema';
import {
    alterResponseErrorToFaramError,
    createParamsForUserCreate,
    urlForUserCreate,
} from '#rest';
import _ts from '#ts';

import styles from './styles.scss';

const propTypes = {
};

const defaultProps = {
};

export default class Register extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            success: false,
        };

        this.schema = {
            fields: {
                firstname: [requiredCondition],
                lastname: [requiredCondition],
                organization: [requiredCondition],
                email: [
                    requiredCondition,
                    emailCondition,
                ],
                recaptchaResponse: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        // Stop any retry action
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
    }

    setResetRecaptchaFunction = (func) => {
        this.resetRecaptcha = func;
    }

    // FORM RELATED

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        this.register(values);
    };

    // REGISTER ACTION

    register = (data) => {
        // Stop previous retry
        if (this.userCreateRequest) {
            this.userCreateRequest.stop();
        }
        this.userCreateRequest = this.createRequestRegister(data);
        this.userCreateRequest.start();
    }

    // REGISTER REST API

    createRequestRegister = ({
        firstname, lastname, organization, country, email, recaptchaResponse,
    }) => {
        const userCreateRequest = new FgRestBuilder()
            .url(urlForUserCreate)
            .params(() => createParamsForUserCreate({
                firstName: firstname,
                lastName: lastname,
                organization,
                country,
                email,
                recaptchaResponse,
            }))
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
                    schema.validate(response, 'userCreateResponse');
                    // go to login
                    this.setState({
                        success: true,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                if (response.errorCode === 4004) {
                    this.setState({
                        faramErrors: {
                            ...faramErrors,
                            $internal: [_ts('register', 'retryRecaptcha')],
                        },
                    });
                } else {
                    // NOTE: server uses username, client side uses email
                    faramErrors.email = faramErrors.username;
                    this.setState({ faramErrors });
                }
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    faramErrors: { $internal: ['Error while trying to register.'] },
                });
            })
            .build();
        return userCreateRequest;
    }

    renderFaram = () => {
        const {
            faramErrors,
            faramValues,
            pending,
        } = this.state;

        return (
            <Faram
                className={styles.registerForm}
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
                <ReCaptcha
                    setResetFunction={this.setResetRecaptchaFunction}
                    faramElementName="recaptchaResponse"
                    siteKey={reCaptchaSiteKey}
                    reset={pending}
                />
                <div className={styles.actionButtons}>
                    <PrimaryButton type="submit" >
                        { _ts('register', 'registerLabel')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }

    renderSuccess = () => {
        const { email } = this.state.faramValues;
        return (
            <div className={styles.registerSuccess}>
                {_ts('register', 'checkYourEmailText', { email })}
            </div>
        );
    }

    render() {
        const {
            success,
        } = this.state;

        return (
            <div className={styles.register}>
                <div className={styles.registerBox}>
                    { success ? this.renderSuccess() : this.renderFaram() }
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
}
