import React, { useCallback, useEffect } from 'react';
import {
    Button,
    TextInput,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    useFormObject,
    createSubmitHandler,
    SetValueArg,
    Error,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';

import NonFieldError from '#newComponents/ui/NonFieldError';

import WidgetSizeInput from '../../WidgetSizeInput';
import { TimeWidget } from '../../types';

import styles from './styles.scss';

type FormType = TimeWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['data']>>;
export type PartialDataType = PartialForm<DataType, 'clientId'>;

type DataSchema = ObjectSchema<PartialDataType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        defaultValue: [],
    }),
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        clientId: [],
        title: [requiredStringCondition],
        type: [],
        order: [],
        width: [],
        parent: [],
        condition: [],

        data: dataSchema,
    }),
};

const defaultVal: PartialDataType = {};

interface DataInputProps<K extends string>{
    name: K;
    value: PartialDataType | undefined;
    error: Error<PartialDataType> | undefined;
    onChange: (value: SetValueArg<PartialDataType | undefined>, name: K) => void;
}

function DataInput<K extends string>(props: DataInputProps<K>) {
    const {
        value,
        error: riskyError,
        onChange,
        name,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultVal);

    const error = getErrorObject(riskyError);

    return (
        <>
            <NonFieldError
                className={styles.error}
                error={error}
            />
            <TextInput // FIXME: use TimeInput when added through deep-ui
                // FIXME: use translation
                label="Default Value"
                className={styles.input}
                name="defaultValue"
                value={value?.defaultValue}
                onChange={onFieldChange}
                error={error?.defaultValue}
            />
        </>
    );
}

interface TimeWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function TimeWidgetForm(props: TimeWidgetFormProps) {
    const {
        onChange,
        onSave,
        onCancel,
        initialValue,
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
            className={styles.form}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                heading={value?.title ?? 'Unnamed'}
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
                horizontallyCompactContent
                sub
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
                <DataInput
                    name="data"
                    value={value.data}
                    onChange={setFieldValue}
                    error={error?.data}
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

export default TimeWidgetForm;
