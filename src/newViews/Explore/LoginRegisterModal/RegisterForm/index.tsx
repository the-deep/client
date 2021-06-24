import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    Button,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    emailCondition,
    createSubmitHandler,
    requiredCondition,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import _ts from '#ts';

import styles from './styles.scss';

interface RegisterFields {
    email: string;
    firstName: string;
    lastName: string;
    organization: string;
}

type FormType = Partial<RegisterFields>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: [emailCondition, requiredCondition],
        firstName: [requiredStringCondition],
        lastName: [requiredStringCondition],
        organization: [requiredStringCondition],
    }),
};

const initialValue: FormType = {};

interface Props {
    className?: string;
}

function RegisterModal(props: Props) {
    const { className } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(initialValue, schema);

    const handleSubmit = useCallback((finalValue) => {
        console.warn('here', finalValue);
    }, []);

    return (
        <form
            className={_cs(styles.registerForm, className)}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
                className={styles.registerFormContainer}
                contentClassName={styles.inputContainer}
                heading={_ts('explore.register', 'registerFormHeader')}
                footerActions={(
                    <Button
                        disabled={pristine}
                        type="submit"
                        variant="primary"
                        name="register"
                    >
                        {_ts('explore.register', 'registerButtonLabel')}
                    </Button>
                )}
            >
                <TextInput
                    name="firstName"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.firstName}
                    error={error?.fields?.firstName}
                    label={_ts('explore.register', 'firstNameLabel')}
                    placeholder={_ts('myProfile', 'firstNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    name="lastName"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.lastName}
                    error={error?.fields?.lastName}
                    label={_ts('explore.register', 'lastNameLabel')}
                    placeholder={_ts('myProfile', 'lastNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    name="organization"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.organization}
                    error={error?.fields?.organization}
                    label={_ts('explore.register', 'organizationLabel')}
                    placeholder={_ts('myProfile', 'organizationPlaceholder')}
                    autoFocus
                />
                <TextInput
                    name="email"
                    className={styles.input}
                    onChange={onValueChange}
                    value={value?.email}
                    error={error?.fields?.email}
                    label={_ts('explore.register', 'emailLabel')}
                    placeholder={_ts('myProfile', 'emailPlaceholder')}
                    autoFocus
                />
            </Container>
        </form>
    );
}

export default RegisterModal;
