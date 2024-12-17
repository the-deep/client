import React, {
    useCallback,
    useMemo,
} from 'react';
import {
    compareDate,
} from '@togglecorp/fujs';
import { gql, useMutation } from '@apollo/client';
import {
    Modal,
    Button,
    TextInput,
    DateInput,
    useAlert,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    removeNull,
    useForm,
    ObjectSchema,
    PartialForm,
    getErrorObject,
    requiredStringCondition,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';
import _ts from '#ts';
import {
    AnalysisCloneInputType,
    AnalysisCloneMutation,
    AnalysisCloneMutationVariables,
} from '#generated/types';

import styles from './styles.css';

const CLONE_ANALYSIS = gql`
mutation AnalysisClone(
    $projectId: ID!,
    $data: AnalysisCloneInputType!,
) {
    project(id: $projectId) {
        analysisClone(data: $data) {
            ok
            errors
            result {
                id
            }
        }
    }
}
`;

type FormType = PartialForm<AnalysisCloneInputType>;
type FormSchema = ObjectSchema<PartialForm<AnalysisCloneInputType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: [requiredStringCondition],
        startDate: [],
        endDate: [requiredStringCondition],
    }),
    validation: (value) => {
        if (
            value?.startDate
            && value?.endDate
            && (compareDate(value.startDate, value.endDate) > 0)
        ) {
            return (_ts('analysis.cloneModal', 'endDateGreaterThanStartDate'));
        }
        return undefined;
    },
};

interface Props {
    projectId: string;
    analysisId: string;
    onClone: () => void;
    onClose: () => void;
    title: string;
    startDate: string | null | undefined;
    endDate: string;
}

function AnalysisCloneModal(props: Props) {
    const {
        onClose,
        projectId,
        analysisId,
        onClone,
        title,
        startDate,
        endDate,
    } = props;

    const alert = useAlert();

    const defaultFormValues: PartialForm<FormType> = useMemo(() => ({
        title: `${title} (cloned)`,
        startDate,
        endDate,
    }), [
        title,
        startDate,
        endDate,
    ]);

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValues);

    const error = getErrorObject(riskyError);

    const [
        triggerAnalysisClone,
        {
            loading: pendingAnalysisClone,
        },
    ] = useMutation<AnalysisCloneMutation, AnalysisCloneMutationVariables>(
        CLONE_ANALYSIS,
        {
            onCompleted: (response) => {
                const {
                    ok,
                    errors,
                } = response?.project?.analysisClone ?? {};

                if (ok) {
                    alert.show(
                        _ts('analysis.cloneModal', 'analysisCloneSuccessful'),
                        {
                            variant: 'success',
                        },
                    );
                    onClone();
                }
                if (errors) {
                    const formError = transformToFormError(removeNull(errors) as ObjectError[]);
                    setError(formError);
                }
            },
            onError: () => {
                alert.show(
                    _ts('analysis.cloneModal', 'analysisCloneFailed'),
                    {
                        variant: 'error',
                    },
                );
            },
        },
    );

    const handleSubmitButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => {
                const finalValue = val as AnalysisCloneInputType;
                triggerAnalysisClone({
                    variables: {
                        data: {
                            analysisId,
                            endDate: finalValue.endDate,
                            startDate: finalValue.startDate,
                            title: finalValue.title,
                        },
                        projectId,
                    },
                });
            },
        );
        submit();
    }, [
        analysisId,
        projectId,
        triggerAnalysisClone,
        setError,
        validate,
    ]);

    const pending = pendingAnalysisClone;

    return (
        <Modal
            onCloseButtonClick={onClose}
            heading={_ts('analysis.cloneModal', 'cloneModalHeading')}
            className={styles.modal}
            size="small"
            freeHeight
            bodyClassName={styles.body}
            footerActions={(
                <Button
                    name={undefined}
                    variant="primary"
                    onClick={handleSubmitButtonClick}
                    disabled={pristine || pending}
                >
                    {_ts('analysis.cloneModal', 'cloneButtonLabel')}
                </Button>
            )}
        >
            {pending && <PendingMessage />}
            <NonFieldError error={error} />
            <TextInput
                name="title"
                className={styles.title}
                label={_ts('analysis.cloneModal', 'analysisCloneTitleLabel')}
                placeholder={_ts('analysis.cloneModal', 'analysisCloneTitlePlaceholder')}
                value={value.title}
                error={error?.title}
                onChange={setFieldValue}
                disabled={pending}
            />
            <div className={styles.inline}>
                <DateInput
                    name="startDate"
                    className={styles.date}
                    label={_ts('analysis.cloneModal', 'analysisCloneStartDateLabel')}
                    value={value.startDate}
                    error={error?.startDate}
                    onChange={setFieldValue}
                    disabled={pending}
                />
                <DateInput
                    name="endDate"
                    className={styles.date}
                    label={_ts('analysis.cloneModal', 'analysisCloneEndDateLabel')}
                    value={value.endDate}
                    error={error?.endDate}
                    onChange={setFieldValue}
                    disabled={pending}
                />
            </div>
        </Modal>
    );
}

export default AnalysisCloneModal;
