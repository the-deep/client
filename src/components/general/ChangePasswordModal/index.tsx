import React, { useCallback } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    requiredCondition,
    lengthGreaterThanCondition,
    lengthSmallerThanCondition,
} from '@togglecorp/toggle-form';
import {
    Button,
    Modal,
    TextInput,
} from '@the-deep/deep-ui';
import NonFieldError from '#components/ui/NonFieldError';
import { useLazyRequest } from '#utils/request';
import _ts from '#ts';
import { User } from '#typings';

import styles from './styles.scss';

type FormType = {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const changePasswordSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        oldPassword: [requiredCondition],
        newPassword: [
            lengthGreaterThanCondition(4),
            lengthSmallerThanCondition(129),
            requiredCondition,
        ],
        confirmPassword: [
            requiredCondition,
        ],
    }),
    validation: (value) => {
        if (
            value?.confirmPassword &&
            value?.newPassword &&
            value.confirmPassword !== value.newPassword) {
            return _ts('changePassword', 'passwordMismatch');
        }
        return undefined;
    },
};

const defaultFormValue: PartialForm<FormType> = {};

export interface Props {
    onModalClose: () => void;
}

function ChangePasswordModal(props: Props) {
    const {
        onModalClose,
    } = props;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(defaultFormValue, changePasswordSchema);

    const {
        pending,
        trigger: changePassword,
    } = useLazyRequest<User, Pick<FormType, 'oldPassword' | 'newPassword'>>({
        url: 'server://users/me/change-password/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onModalClose();
        },
        onFailure: (err) => {
            onErrorSet({ fields: { ...err.value.faramErrors } });
        },
        failureHeader: _ts('changePassword', 'title'),
    });

    const handleSubmitButtonClick = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            changePassword({ oldPassword: val.oldPassword, newPassword: val.newPassword });
        }
    }, [onErrorSet, validate, changePassword]);

    return (
        <Modal
            className={styles.changePasswordModal}
            heading={_ts('changePassword', 'title')}
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <>
                    <Button
                        name={undefined}
                        variant="secondary"
                        disabled={pristine || pending}
                        onClick={onModalClose}
                    >
                        {_ts('changePassword', 'cancel')}
                    </Button>
                    <Button
                        name={undefined}
                        variant="primary"
                        type="submit"
                        disabled={pristine || pending}
                        onClick={handleSubmitButtonClick}
                    >
                        {_ts('changePassword', 'change')}
                    </Button>
                </>
            )}
        >
            <NonFieldError error={error} />
            <TextInput // FIXME: use PasswordInput when availabe
                name="oldPassword"
                type="password"
                label={_ts('changePassword', 'currentPassword')}
                placeholder={_ts('changePassword', 'currentPassword')}
                value={value.oldPassword}
                error={error?.fields?.oldPassword}
                disabled={pending}
                onChange={onValueChange}
            />
            <TextInput // FIXME: use PasswordInput when availabe
                name="newPassword"
                type="password"
                label={_ts('changePassword', 'newPassword')}
                placeholder={_ts('changePassword', 'newPassword')}
                value={value.newPassword}
                error={error?.fields?.newPassword}
                disabled={pending}
                onChange={onValueChange}
            />
            <TextInput // FIXME: use PasswordInput when availabe
                name="confirmPassword"
                type="password"
                label={_ts('changePassword', 'retypePassword')}
                placeholder={_ts('changePassword', 'retypePassword')}
                value={value.confirmPassword}
                error={error?.fields?.confirmPassword}
                disabled={pending}
                onChange={onValueChange}
            />
        </Modal>
    );
}

export default ChangePasswordModal;
