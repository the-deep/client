import React, { useCallback } from 'react';
import {
    compareDate,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    TextInput,
    DateInput,
    useAlert,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    getErrorObject,
    requiredStringCondition,
    createSubmitHandler,
} from '@togglecorp/toggle-form';

import { useLazyRequest } from '#base/utils/restRequest';
import NonFieldError from '#components/NonFieldError';
import _ts from '#ts';

import styles from './styles.css';

type FormType = {
    title: string;
    startDate: string;
    endDate: string;
};

type FormSchema = ObjectSchema<PartialForm<FormType>>;
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

const defaultFormValue: PartialForm<FormType> = {};

interface CloneProperties {
    title: string;
    endDate: string;
    startDate: string;
}

interface Props {
    onClose: () => void;
    projectId: string;
    analysisId: string;
    onClone: () => void;
}

function AnalysisCloneModal(props: Props) {
    const {
        onClose,
        projectId,
        analysisId,
        onClone,
    } = props;

    const alert = useAlert();

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const {
        pending: pendingAnalysisClone,
        trigger: triggerAnalysisClone,
    } = useLazyRequest<CloneProperties, FormType>({
        url: `server://projects/${projectId}/analysis/${analysisId}/clone/`,
        method: 'POST',
        body: (ctx) => ctx,
        onSuccess: () => {
            alert.show(
                _ts('analysis.cloneModal', 'analysisCloneSuccessful'),
                {
                    variant: 'success',
                },
            );
            onClone();
        },
        failureMessage: _ts('analysis.cloneModal', 'analysisCloneFailed'),
    });

    const handleSubmitButtonClick = useCallback(() => {
        const submit = createSubmitHandler(
            validate,
            setError,
            (val) => triggerAnalysisClone(val as FormType),
        );
        submit();
    }, [triggerAnalysisClone, setError, validate]);

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
