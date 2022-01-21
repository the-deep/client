import React, { useMemo, useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Modal,
    Button,
    SelectInput,
    useAlert,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import _ts from '#ts';
import { useLazyRequest } from '#base/utils/restRequest';
import NewUserSelectInput, { User } from '#components/selections/NewUserSelectInput';

import { Membership } from '../../AddUsergroupModal';
import styles from './styles.css';

type FormType = {
    member: string;
    role: string;
    group?: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        member: [requiredCondition],
        role: [requiredCondition],
        group: [requiredCondition],
    }),
};

interface Role {
    id: 'normal' | 'admin';
    title: string;
}

const roles: Role[] = [
    {
        id: 'normal',
        title: 'Normal',
    },
    {
        id: 'admin',
        title: 'Admin',
    },

];
const keySelector = (d: Role) => d.id;
const labelSelector = (d: Role) => d.title;

interface Props {
    onModalClose: () => void;
    userGroupId: string;
    onUserAddSuccess: () => void;
    userToEdit?: {
        id: string;
        member: string;
        role: 'admin' | 'normal';
    };
    users?: User[];
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        userGroupId,
        onUserAddSuccess,
        userToEdit,
        users,
    } = props;

    const alert = useAlert();
    const [userOptions, setUserOptions] = useState<User[] | null | undefined>(users);

    const formValue: PartialForm<FormType> = useMemo(() => ({
        group: userGroupId,
        member: userToEdit?.member,
        role: userToEdit?.role,
    }), [userToEdit, userGroupId]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValue);

    const error = getErrorObject(riskyError);

    const {
        pending: pendingAddMember,
        trigger: triggerAddMember,
    } = useLazyRequest<Membership, FormType>({
        url: isDefined(userToEdit)
            ? `server://group-memberships/${userToEdit.id}/`
            : 'server://group-memberships/',
        method: isDefined(userToEdit?.id)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            onUserAddSuccess();
            onModalClose();
            if (isDefined(userToEdit?.id)) {
                alert.show(
                    'Successfully edited user membership.',
                    { variant: 'success' },
                );
            } else {
                alert.show(
                    'Successfully added user to user group.',
                    { variant: 'success' },
                );
            }
        },
        onFailure: () => {
            if (isDefined(userToEdit?.id)) {
                alert.show(
                    'Failed to change user membership.',
                    { variant: 'error' },
                );
            } else {
                alert.show(
                    'Failed to add user to user group.',
                    { variant: 'error' },
                );
            }
        },
    });

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => triggerAddMember(val as FormType),
        );
        submit();
    }, [setError, validate, triggerAddMember]);

    return (
        <Modal
            heading={(isDefined(userToEdit)
                ? _ts('usergroup.memberEditModal', 'editMemberLabel')
                : _ts('usergroup.memberEditModal', 'addMemberLabel')
            )}
            onCloseButtonClick={onModalClose}
            className={styles.modal}
            size="small"
            freeHeight
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || pendingAddMember}
                    onClick={handleSubmit}
                >
                    {_ts('usergroup.editModal', 'submitLabel')}
                </Button>
            )}
        >
            <NewUserSelectInput
                name="member"
                value={value.member}
                onChange={setFieldValue}
                options={userOptions}
                onOptionsChange={setUserOptions}
                error={error?.member}
                disabled={pendingAddMember || isDefined(userToEdit)}
                label={_ts('usergroup.memberEditModal', 'addMemberLabel')}
                placeholder={_ts('usergroup.memberEditModal', 'addMemberPlaceholderLabel')}
                membersExcludeUsergroup={userGroupId}
            />
            <SelectInput
                name="role"
                labelSelector={labelSelector}
                keySelector={keySelector}
                options={roles}
                label={_ts('usergroup.memberEditModal', 'roleLabel')}
                placeholder={_ts('usergroup.memberEditModal', 'roleLabel')}
                onChange={setFieldValue}
                value={value.role}
                error={error?.role}
                disabled={pendingAddMember}
            />
        </Modal>
    );
}

export default AddUserModal;
