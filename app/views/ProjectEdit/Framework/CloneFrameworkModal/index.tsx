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
    createSubmitHandler,
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
    frameworkToClone: string;
    frameworkTitle?: string;
    frameworkDescription?: string;
    onCloneSuccess: (newFrameworkId: string) => void;
    onModalClose: () => void;
}

function CloneFrameworkModal(props: Props) {
    const {
        className,
        frameworkToClone,
        frameworkTitle,
        frameworkDescription,
        onCloneSuccess,
        onModalClose,
    } = props;

    const formValueFromProps: PartialForm<FormType> = frameworkTitle ? {
        title: `${frameworkTitle} (cloned)`,
        description: frameworkDescription,
    } : defaultFormValue;

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
        pending: pendingCloneAction,
        trigger: triggerCreateFramework,
    } = useLazyRequest<Framework, ValueToSend>({
        url: `server://clone-analysis-framework/${frameworkToClone}/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: (response) => {
            onCloneSuccess(String(response.id));
            alert.show(
                _ts('projectEdit', 'cloneFrameworkSuccessMessage'),
                { variant: 'success' },
            );
        },
        failureHeader: _ts('projectEdit', 'projectMembershipPostFailed'),
    });

    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => triggerCreateFramework(val as ValueToSend),
            );
            submit();
        },
        [setError, validate, triggerCreateFramework],
    );

    const pendingRequests = pendingCloneAction;

    return (
        <Modal
            className={_cs(className, styles.modal)}
            size="small"
            freeHeight
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
                    disabled={pristine || pendingCloneAction}
                    onClick={handleSubmit}
                >
                    {_ts('projectEdit', 'submitLabel')}
                </Button>
            )}
        >
            {pendingRequests && <PendingMessage />}
            <TextInput
                name="title"
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

export default CloneFrameworkModal;
