import React, { useCallback } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    Modal,
    useAlert,
    TextInput,
    TextArea,
    Button,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    requiredStringCondition,
    useForm,
    getErrorObject,
} from '@togglecorp/toggle-form';

import { useLazyRequest } from '#base/utils/restRequest';
import _ts from '#ts';

import styles from './styles.css';

type FormType = {
    title: string;
    description?: string;
};

interface Framework {
    id: number;
}

type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        description: [],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

interface ValueToSend {
    title: string;
    description?: string;
}

interface Props {
    className?: string;
    frameworkToClone?: FormType;
    onActionSuccess: (newFrameworkId: string) => void;
    onModalClose: () => void;
}

function addCloneLabel(details: FormType | undefined) {
    if (!details) {
        return undefined;
    }

    return ({
        title: `${details.title} (cloned)`,
        description: details.description,
    });
}

function AddFrameworkModal(props: Props) {
    const {
        className,
        frameworkToClone,
        onActionSuccess,
        onModalClose,
    } = props;

    const formValueFromProps: PartialForm<FormType> = addCloneLabel(frameworkToClone)
        ?? defaultFormValue;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, formValueFromProps);
    const alert = useAlert();

    const error = getErrorObject(riskyError);

    const {
        pending: pendingAddAction,
        trigger: triggerCreateFramework,
    } = useLazyRequest<Framework, ValueToSend>({
        url: 'server://analysis-frameworks/',
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onActionSuccess(String(response.id));
            const message = isDefined(frameworkToClone)
                ? _ts('projectEdit', 'cloneFrameworkSuccessMessage')
                : _ts('projectEdit', 'createFrameworkSuccessMessage');
            alert.show(
                message,
                { variant: 'success' },
            );
        },
        failureHeader: _ts('projectEdit', 'projectMembershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const { errored, error: err, value: val } = validate();
            setError(err);
            if (!errored && isDefined(val)) {
                triggerCreateFramework(val as ValueToSend);
            }
        },
        [setError, validate, triggerCreateFramework],
    );

    const pendingRequests = pendingAddAction;

    return (
        <Modal
            className={_cs(className, styles.modal)}
            heading={
                isDefined(frameworkToClone)
                    ? _ts('projectEdit', 'cloneFrameworkHeading')
                    : _ts('projectEdit', 'addFrameworkHeading')
            }
            onCloseButtonClick={onModalClose}
            bodyClassName={styles.modalBody}
            footerActions={(
                <Button
                    name="submit"
                    variant="primary"
                    type="submit"
                    disabled={pristine || pendingAddAction}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {pendingRequests && <PendingMessage />}
            <TextInput
                name="title"
                className={styles.input}
                onChange={setFieldValue}
                value={value.title}
                label={_ts('projectEdit', 'titleLabel')}
                placeholder={_ts('projectEdit', 'titlePlaceholder')}
                error={error?.title}
                disabled={pendingRequests}
            />
            <TextArea
                name="description"
                rows={5}
                className={styles.input}
                onChange={setFieldValue}
                value={value.description}
                label={_ts('projectEdit', 'descriptionLabel')}
                placeholder={_ts('projectEdit', 'descriptionPlaceholder')}
                error={error?.description}
                disabled={pendingRequests}
            />
        </Modal>
    );
}

export default AddFrameworkModal;
