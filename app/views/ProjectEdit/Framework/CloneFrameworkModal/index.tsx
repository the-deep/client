import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
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
    removeNull,
    requiredStringCondition,
    useForm,
    getErrorObject,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import {
    AnalysisFrameworkCloneMutation,
    AnalysisFrameworkCloneMutationVariables,
} from '#generated/types';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import _ts from '#ts';

import styles from './styles.css';

const CLONE_FRAMEWORK = gql`
    mutation analysisFrameworkClone(
        $data: AnalysisFrameworkCloneInputType!,
    ) {
        analysisFrameworkClone(
            data: $data
        ) {
            errors
            ok
            result {
                id
                title
            }
        }
    }
`;

type FormType = NonNullable<AnalysisFrameworkCloneMutationVariables['data']>;
type PartialFormType = Partial<FormType>;

type FormSchema = ObjectSchema<PartialForm<PartialFormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        afId: [requiredStringCondition],
        project: [requiredStringCondition],
        title: [requiredStringCondition],
        description: [requiredStringCondition],
    }),
};

interface Props {
    className?: string;
    projectId: string;
    frameworkToClone: string;
    frameworkTitle?: string;
    frameworkDescription?: string;
    onCloneSuccess: (newFrameworkId: string) => void;
    onModalClose: () => void;
}

function CloneFrameworkModal(props: Props) {
    const {
        className,
        projectId,
        frameworkToClone,
        frameworkTitle,
        frameworkDescription,
        onCloneSuccess,
        onModalClose,
    } = props;

    const defaultFormValue: PartialFormType = useMemo(() => ({
        afId: frameworkToClone,
        project: projectId,
    }), [frameworkToClone, projectId]);

    const formValueFromProps: PartialFormType = useMemo(() => (
        frameworkTitle ? {
            ...defaultFormValue,
            title: `${frameworkTitle} (cloned)`,
            description: frameworkDescription,
        } : defaultFormValue
    ), [
        frameworkDescription,
        frameworkTitle,
        defaultFormValue,
    ]);

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

    const [
        cloneFramework,
        { loading: cloneFrameworkPending },
    ] = useMutation<AnalysisFrameworkCloneMutation, AnalysisFrameworkCloneMutationVariables>(
        CLONE_FRAMEWORK,
        {
            onCompleted: (response) => {
                const cloneFrameworkResponse = response
                    ?.analysisFrameworkClone;
                if (cloneFrameworkResponse?.ok && cloneFrameworkResponse.result?.id) {
                    alert.show(
                        'Successfully cloned framework.',
                        { variant: 'success' },
                    );
                    onCloneSuccess(cloneFrameworkResponse.result?.id);
                } else if (cloneFrameworkResponse?.errors) {
                    const formError = transformToFormError(
                        removeNull(cloneFrameworkResponse.errors) as ObjectError[],
                    );
                    setError(formError);
                    alert.show(
                        'Failed to clone framework.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to clone framework',
                    { variant: 'error' },
                );
            },
        },
    );
    const handleSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => cloneFramework({
                    variables: {
                        data: val as FormType,
                    },
                }),
            );
            submit();
        },
        [
            setError,
            validate,
            cloneFramework,
        ],
    );

    const pendingRequests = cloneFrameworkPending;

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
                    disabled={pristine || cloneFrameworkPending}
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
