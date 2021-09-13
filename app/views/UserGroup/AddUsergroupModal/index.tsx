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

interface UsergroupAdd {
    title: string;
    description?: string;
}

type FormType = {
    id?: number;
    title: string;
};

export interface Membership {
    id: number;
    member: number;
    memberName: string;
    memberEmail: string;
    role: 'admin' | 'normal';
    group: number;
    joinedAt: string;
}

export interface Usergroup {
    id: number;
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
    onSuccess: () => void;
    value?: Usergroup,
}
function AddUsergroupModal(props: Props) {
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
        pending: pendingAddUsergroup,
        trigger: triggerAddUsergroup,
    } = useLazyRequest<unknown, UsergroupAdd>({
        url: isDefined(initialValue?.id)
            ? `server://user-groups/${initialValue?.id}/`
            : 'server://user-groups/',
        method: isDefined(initialValue?.id)
            ? 'PATCH'
            : 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            onSuccess();
            onModalClose();
        },
        failureHeader: _ts('usergroup.editModal', 'addUsergroupFailed'),
    });
    const handleSubmit = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => triggerAddUsergroup(val as UsergroupAdd),
        );
        submit();
    }, [setError, validate, triggerAddUsergroup]);

    return (
        <Modal
            heading={_ts('usergroup.editModal', 'addUsergroupHeading')}
            onCloseButtonClick={onModalClose}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || pendingAddUsergroup}
                    onClick={handleSubmit}
                >
                    {_ts('usergroup.editModal', 'submitLabel')}
                </Button>
            )}
        >
            {pendingAddUsergroup && (<PendingMessage />)}
            <NonFieldError error={error} />
            <TextInput
                name="title"
                value={value.title}
                error={error?.title}
                onChange={setFieldValue}
                label={_ts('usergroup.editModal', 'usergroupTitleLabel')}
                placeholder={_ts('usergroup.editModal', 'usergroupTitlePlaceholder')}
            />
        </Modal>
    );
}

export default AddUsergroupModal;
