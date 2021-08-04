import React, { useCallback } from 'react';
import {
    isDefined,
    compareDate,
} from '@togglecorp/fujs';
import {
    Modal,
    Button,
    TextInput,
    DateInput,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    useForm,
    ObjectSchema,
    PartialForm,
    getErrorObject,
    requiredStringCondition,
} from '@togglecorp/toggle-form';

import { useRequest, useLazyRequest } from '#utils/request';
import NonFieldError from '#newComponents/ui/NonFieldError';
import _ts from '#ts';
import notify from '#notify';
import { AnalysisElement } from '#types/analysisModule';

import styles from './styles.scss';

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
    projectId: number;
    analysisId: number;
    onClone: () => void;
}

function AnalysisCloneModal(props: Props) {
    const {
        onClose,
        projectId,
        analysisId,
        onClone,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const {
        pending: pendingAnalysisGet,
    } = useRequest<AnalysisElement>({
        url: `server://projects/${projectId}/analysis/${analysisId}/`,
        method: 'GET',
        onSuccess: (response) => {
            setValue({
                title: response.title,
                startDate: response.startDate,
                endDate: response.endDate,
            });
        },
        failureHeader: _ts('analysis.cloneModal', 'anaylsisDetailsFetchFailed'),
    });


    const {
        pending: pendingAnalysisClone,
        trigger: triggerAnalysisClone,
    } = useLazyRequest<CloneProperties, FormType>({
        url: `server://projects/${projectId}/analysis/${analysisId}/clone/`,
        method: 'POST',
        body: ctx => ctx,
        onSuccess: () => {
            notify.send({
                title: _ts('analysis.cloneModal', 'analysisClone'),
                type: notify.type.SUCCESS,
                message: _ts('analysis.cloneModal', 'analysisCloneSuccessful'),
                duration: notify.duration.MEDIUM,
            });
            onClone();
        },
        failureHeader: _ts('analysis.cloneModal', 'anaylsisCloneFailed'),
    });

    const handleSubmitButtonClick = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            triggerAnalysisClone(val as FormType);
        }
    }, [triggerAnalysisClone, setError, validate]);

    const pending = pendingAnalysisClone || pendingAnalysisGet;

    return (
        <Modal
            onCloseButtonClick={onClose}
            heading={_ts('analysis.cloneModal', 'cloneModalHeading')}
            className={styles.modal}
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
