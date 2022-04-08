import React, { useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    Modal,
    Button,
    PendingMessage,
    TextInput,
    useAlert,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
    removeNull,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import _ts from '#ts';

import {
    UserGroupType,
    UserGroupCreateMutation,
    UserGroupCreateMutationVariables,
    UserGroupUpdateMutation,
    UserGroupUpdateMutationVariables,
} from '#generated/types';

const USER_GROUP_CREATE = gql`
mutation UserGroupCreate(
    $data: UserGroupInputType!,
) {
    userGroupCreate(data: $data) {
        errors
        ok
        result {
          id
          currentUserRole
          title
        }
    }
}
`;

const USER_GROUP_UPDATE = gql`
    mutation UserGroupUpdate(
        $id:ID!,
        $data: UserGroupInputType!,
        ) {
        userGroup(
            id: $id,
        ) {
            id
            userGroupUpdate(data: $data) {
                errors
                ok
                result {
                  id
                  currentUserRole
                  title
                }
            }
        }
    }
`;

type FormType = {
    id?: number;
    title: string;
};

export interface Membership {
    id: string;
    member: string;
    memberName: string;
    memberEmail: string;
    role: 'admin' | 'normal';
    group: string;
    joinedAt: string;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    onSuccess: (userGroupId: string) => void;
    value?: UserGroupType,
}
function AddUserGroupModal(props: Props) {
    const {
        onModalClose,
        onSuccess,
        value: initialValue,
    } = props;

    const alert = useAlert();

    const [initialFormValue] = useState<PartialForm<FormType>>(
        isDefined(initialValue) ? ({
            title: initialValue.title,
        }) : defaultFormValue,
    );

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, initialFormValue);

    const error = getErrorObject(riskyError);

    const [
        createUsergroup,
        {
            loading: createUsergroupPending,
        },
    ] = useMutation<UserGroupCreateMutation, UserGroupCreateMutationVariables>(
        USER_GROUP_CREATE,
        {
            onCompleted: (response) => {
                if (!response || !response.userGroupCreate) {
                    return;
                }

                const {
                    ok,
                    errors,
                } = response.userGroupCreate;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to create user group.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    const responseId = response.userGroupCreate.result?.id;
                    if (responseId) {
                        onSuccess(responseId);
                    }
                    alert.show(
                        'Successfully created user group!',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create user group.',
                    { variant: 'error' },
                );
            },
        },
    );

    const [
        updateUsergroup,
        {
            loading: updateUsergroupPending,
        },
    ] = useMutation<UserGroupUpdateMutation, UserGroupUpdateMutationVariables>(
        USER_GROUP_UPDATE,
        {
            onCompleted: (response) => {
                const responseData = response?.userGroup?.userGroupUpdate;
                if (!responseData) {
                    return;
                }

                const {
                    ok,
                    errors,
                } = responseData;

                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                    alert.show(
                        'Failed to update user group.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    const responseId = response.userGroup?.userGroupUpdate?.result?.id;

                    if (responseId) {
                        onSuccess(responseId);
                    }
                    alert.show(
                        'Successfully updated user group!',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to update user group.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const data = val as FormType;
                if (initialValue?.id) {
                    updateUsergroup({
                        variables: {
                            data,
                            id: initialValue.id,
                        },
                    });
                } else {
                    createUsergroup({
                        variables: {
                            data,
                        },
                    });
                }
            },
        );
        submit();
    }, [
        setError,
        validate,
        updateUsergroup,
        createUsergroup,
        initialValue?.id,
    ]);

    return (
        <Modal
            heading={_ts('usergroup.editModal', 'addUsergroupHeading')}
            onCloseButtonClick={onModalClose}
            size="extraSmall"
            freeHeight
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || createUsergroupPending || updateUsergroupPending}
                    onClick={handleSubmit}
                >
                    {_ts('usergroup.editModal', 'submitLabel')}
                </Button>
            )}
        >
            {(createUsergroupPending || updateUsergroupPending) && (<PendingMessage />)}
            <NonFieldError error={error} />
            <TextInput
                name="title"
                value={value.title}
                error={error?.title}
                onChange={setFieldValue}
                label="Title"
                placeholder={_ts('usergroup.editModal', 'usergroupTitlePlaceholder')}
                autoFocus
            />
        </Modal>
    );
}

export default AddUserGroupModal;
