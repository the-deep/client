import React, { useMemo, useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    Modal,
    Button,
    SelectInput,
    useAlert,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
    internal,
    removeNull,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';

import _ts from '#ts';
import NonFieldError from '#components/NonFieldError';
import NewUserSelectInput, { User } from '#components/selections/NewUserSelectInput';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    UserGroupMembershipBulkEditMutation,
    UserGroupMembershipBulkEditMutationVariables,
} from '#generated/types';
import styles from './styles.css';

const USER_GROUP_MEMBERSHIP_EDIT = gql`
    mutation UserGroupMembershipBulkEdit(
        $id:ID!,
        $items: [BulkUserGroupMembershipInputType!],
        ) {
        userGroup(
            id: $id,
        ) {
            id
            userGroupMembershipBulk(
                items: $items,
            ) {
                errors
                deletedResult {
                    id
                    clientId
                    role
                    roleDisplay
                    member {
                      id
                      displayName
                    }
                }
                result {
                    clientId
                    id
                    member {
                      id
                      displayName
                    }
                    role
                }
            }
        }
    }
`;

type FormType = {
    member: string;
    role: string;
    id?: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        member: [requiredCondition],
        role: [requiredCondition],
        id: [defaultUndefinedType],
    }),
};

interface Role {
    id: 'NORMAL' | 'ADMIN';
    title: string;
}

const roles: Role[] = [
    {
        id: 'NORMAL',
        title: 'Normal',
    },
    {
        id: 'ADMIN',
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
        role: 'ADMIN' | 'NORMAL';
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
        id: userToEdit?.id,
        member: userToEdit?.member,
        role: userToEdit?.role,
    }), [userToEdit]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValue);

    const error = getErrorObject(riskyError);

    const [
        bulkEditUsergroupMembership,
        { loading: bulkEditUsergroupMembershipPending },
    ] = useMutation<
        UserGroupMembershipBulkEditMutation,
        UserGroupMembershipBulkEditMutationVariables
    >(
        USER_GROUP_MEMBERSHIP_EDIT,
        {
            onCompleted: (response) => {
                if (!response?.userGroup?.userGroupMembershipBulk) {
                    return;
                }
                const {
                    errors,
                    result,
                } = response.userGroup.userGroupMembershipBulk;

                const [err] = errors ?? [];
                const [user] = result ?? [];
                if (err) {
                    const formError = transformToFormError(removeNull(err) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        userToEdit?.id
                            ? 'Failed to update membership.'
                            : 'Failed to add membership.',
                        { variant: 'error' },
                    );
                } else if (user) {
                    alert.show(
                        userToEdit?.id
                            ? `Successfully updated ${user.member.displayName}.`
                            : `Successfully added ${user.member.displayName}.`,
                        { variant: 'success' },
                    );
                    onUserAddSuccess();
                    onModalClose();
                }
            },
            onError: (gqlError) => {
                setError({
                    [internal]: gqlError.message,
                });
                alert.show(
                    userToEdit?.id
                        ? 'Failed to update membership.'
                        : 'Failed to add membership.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => bulkEditUsergroupMembership({
                variables: {
                    id: userGroupId,
                    items: [val as NonNullable<UserGroupMembershipBulkEditMutationVariables['items']>[number]],
                },
            }),
        );
        submit();
    }, [
        setError,
        validate,
        bulkEditUsergroupMembership,
        userGroupId,
    ]);

    return (
        <Modal
            heading={(isDefined(userToEdit)
                ? _ts('usergroup.memberEditModal', 'editMemberLabel')
                : _ts('usergroup.memberEditModal', 'addMemberHeaderLabel')
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
                    disabled={pristine || bulkEditUsergroupMembershipPending}
                    onClick={handleSubmit}
                >
                    {_ts('usergroup.editModal', 'submitLabel')}
                </Button>
            )}
        >
            {bulkEditUsergroupMembershipPending && (<PendingMessage />)}
            <NonFieldError error={error} />
            <NewUserSelectInput
                name="member"
                value={value.member}
                onChange={setFieldValue}
                options={userOptions}
                onOptionsChange={setUserOptions}
                error={error?.member}
                disabled={bulkEditUsergroupMembershipPending || isDefined(userToEdit)}
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
                disabled={bulkEditUsergroupMembershipPending}
            />
        </Modal>
    );
}

export default AddUserModal;
