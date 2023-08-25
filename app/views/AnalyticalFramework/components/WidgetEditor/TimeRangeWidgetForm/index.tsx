import React, { useCallback, useEffect } from 'react';
import {
    Button,
    Container,
    TextInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    createSubmitHandler,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';

import { TimeRangeWidget } from '#types/newAnalyticalFramework';
import WidgetSizeInput from '../../WidgetSizeInput';
import styles from './styles.css';

type FormType = TimeRangeWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        key: [],
        clientId: [],
        title: [requiredStringCondition],
        widgetId: [],
        order: [],
        width: [],
        version: [],
        conditional: [],
    }),
};

interface TimeRangeWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}

function TimeRangeWidgetForm(props: TimeRangeWidgetFormProps) {
    const {
        onChange,
        onSave,
        onCancel,
        initialValue,
        className,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        validate,
        setFieldValue,
        setError,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    useEffect(
        () => {
            onChange(value);
        },
        [value, onChange],
    );

    const handleSubmit = useCallback(
        (values: PartialFormType) => {
            onSave(values as FormType);
        },
        [onSave],
    );

    return (
        <form
            className={_cs(styles.timeRangeWidgetForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.container}
                heading={value.title ?? 'Unnamed'}
                headerActions={(
                    <>
                        <Button
                            name={undefined}
                            onClick={onCancel}
                            variant="tertiary"
                            // FIXME: use strings
                        >
                            Cancel
                        </Button>
                        <Button
                            name={undefined}
                            type="submit"
                            disabled={pristine}
                            // FIXME: use strings
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <NonFieldError
                    className={styles.error}
                    error={error}
                />
                <TextInput
                    // FIXME: use translation
                    className={styles.input}
                    label="Title"
                    name="title"
                    autoFocus
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <WidgetSizeInput
                    name="width"
                    className={styles.input}
                    value={value.width}
                    onChange={setFieldValue}
                    error={error?.width}
                />
            </Container>
        </form>
    );
}

export default TimeRangeWidgetForm;
