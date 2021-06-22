import React, { useCallback } from 'react';
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
    requiredCondition,
    useForm,
} from '@togglecorp/toggle-form';

import { useLazyRequest } from '#utils/request';
import NonFieldError from '#components/ui/NonFieldError';
import _ts from '#ts';
import styles from './styles.scss';

interface UsergroupAdd {
    title: string;
    description?: string;
}

type FormType = {
    id?: number;
    title: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredCondition],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    onModalClose: () => void;
    onTableReload: () => void;
}
function AddUsergroupModal(props: Props) {
    const {
        onModalClose,
        onTableReload,
    } = props;

    const formValue: PartialForm<FormType> = defaultFormValue;

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(formValue, schema);

    const {
        pending: pendingAddUsergroup,
        trigger: triggerAddUsergroup,
    } = useLazyRequest<unknown, UsergroupAdd>({
        url: 'server://user-groups/',
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            onModalClose();
            onTableReload();
        },
        failureHeader: _ts('usergroup.editModal', 'addUsergroupFailed'),
    });
    const handleSubmit = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            triggerAddUsergroup(val as UsergroupAdd);
        }
    }, [onErrorSet, validate, triggerAddUsergroup]);

    return (
        <Modal
            className={styles.modal}
            heading={_ts('usergroup.editModal', 'addUsergroupHeading')}
            onCloseButtonClick={onModalClose}
            footer={(
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
                className={styles.input}
                value={value.title}
                error={error?.fields?.title}
                onChange={onValueChange}
                label={_ts('usergroup.editModal', 'usergroupTitleLabel')}
                placeholder={_ts('usergroup.editModal', 'usergroupTitlePlaceholder')}
            />
        </Modal>
    );
}

export default AddUsergroupModal;
