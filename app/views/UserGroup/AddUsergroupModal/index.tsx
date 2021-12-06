import React, { useCallback, useState } from 'react';
import { isDefined } from '@togglecorp/fujs';
import {
    Modal,
    Button,
    PendingMessage,
    TextInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';

interface UserGroupAdd {
    title: string;
    description?: string;
}

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

export interface UserGroup {
    id: string;
    title: string;
    description: string;
    role: 'admin' | 'normal';
    membersCount: number;
    memberships: Membership[];
    globalCrisisMonitoring: boolean;
    createdAt: string;
    modifiedAt: string;
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
    value?: UserGroup,
}
function AddUserGroupModal(props: Props) {
    const {
        onModalClose,
        onSuccess,
        value: initialValue,
    } = props;

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

    const {
        pending: pendingAddUserGroup,
        trigger: triggerAddUserGroup,
    } = useLazyRequest<UserGroup, UserGroupAdd>({
        url: isDefined(initialValue?.id)
            ? `server://user-groups/${initialValue?.id}/`
            : 'server://user-groups/',
        method: isDefined(initialValue?.id)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onSuccess(response.id);
            onModalClose();
        },
        failureHeader: _ts('usergroup.editModal', 'addUsergroupFailed'),
    });
    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => triggerAddUserGroup(val as UserGroupAdd),
        );
        submit();
    }, [setError, validate, triggerAddUserGroup]);

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
                    disabled={pristine || pendingAddUserGroup}
                    onClick={handleSubmit}
                >
                    {_ts('usergroup.editModal', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddUserGroup && (<PendingMessage />)}
            <NonFieldError error={error} />
            <TextInput
                name="title"
                value={value.title}
                error={error?.title}
                onChange={setFieldValue}
                label="Title"
                placeholder={_ts('usergroup.editModal', 'usergroupTitlePlaceholder')}
            />
        </Modal>
    );
}

export default AddUserGroupModal;
