import React, { useCallback, useState } from 'react';

import { isDefined } from '@togglecorp/fujs';

import {
    Modal,
    Button,
    SelectInput,
} from '@the-deep/deep-ui';

import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';

import _ts from '#ts';
import { useLazyRequest } from '#utils/request';
import UserSelectInput from '#components/input/UserSelectInput';
import {
    BasicUser,
} from '#typings';

import { Membership } from '../AddUsergroupModal';
import styles from './styles.scss';

type FormType = {
    member: number;
    role: string;
    group?: number;
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
    id: string;
    title: string;
}

const roles:Role[] = [
    {
        id: 'normal',
        title: 'Normal',
    },
    {
        id: 'admin',
        title: 'Admin',
    },

];
const keySelector = (d:Role) => d.id;
const labelSelector = (d:Role) => d.title;

interface Props {
    onModalClose: () => void;
    group: number;
    onUserAddSuccess: () => void;
    memberToEdit?: member;
    member?: number;
    memberOptions?: BasicUser[];
}

function AddUserModal(props: Props) {
    const {
        onModalClose,
        group,
        onUserAddSuccess,
        member,
        memberToEdit,
        memberOptions,
    } = props;

    const [userOptions, setUserOptions] = useState<BasicUser[] | null | undefined>();
    const formValue: PartialForm<FormType> = { group, member };

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(formValue, schema);

    const {
        pending: pendingAddMember,
        trigger: triggerAddMember,
    } = useLazyRequest<Membership, FormType>({
        url: isDefined(memberToEdit)
            ? `server://group-memberships/${memberToEdit}/`
            : 'server://group-memberships/',
        method: isDefined(memberToEdit)
            ? 'PATCH'
            : 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onUserAddSuccess();
            onModalClose();
        },
        failureHeader: _ts('usergroup.memberEditModal', 'memberAddFailed'),
    });

    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            triggerAddMember(val as FormType);
        }
    }, [onErrorSet, validate, triggerAddMember]);

    return (
        <Modal
            heading={isDefined(member)
                ? _ts('usergroup.memberEditModal', 'editMemberLabel')
                : _ts('usergroup.memberEditModal', 'addMemberLabel')
            }
            onCloseButtonClick={onModalClose}
            className={styles.modal}
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
            <UserSelectInput
                className={styles.input}
                name="member"
                value={value.member}
                onChange={onValueChange}
                options={isDefined(member)
                    ? memberOptions
                    : userOptions
                }
                onOptionsChange={setUserOptions}
                error={error?.fields?.member}
                disabled={pendingAddMember || isDefined(member)}
                label={_ts('usergroup.memberEditModal', 'addMemberLabel')}
                placeholder={_ts('usergroup.memberEditModal', 'addMemberPlaceholderLabel')}
            />
            <SelectInput
                name="role"
                className={styles.input}
                labelSelector={labelSelector}
                keySelector={keySelector}
                options={roles}
                placeholder={_ts('usergroup.memberEditModal', 'roleLabel')}
                onChange={onValueChange}
                value={value.role}
                error={error?.fields?.role}
                disabled={pendingAddMember}
            />
        </Modal>
    );
}

export default AddUserModal;
