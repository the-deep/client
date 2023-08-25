import React, { useCallback, useEffect } from 'react';
import {
    Button,
    TextInput,
    NumberInput,
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
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import {
    isTruthy,
    _cs,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';

import { NumberWidget } from '#types/newAnalyticalFramework';
import WidgetSizeInput from '../../WidgetSizeInput';

import styles from './styles.css';

type FormType = NumberWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['properties']>>;
export type PartialDataType = PartialForm<DataType, 'key'>;

type DataSchema = ObjectSchema<PartialDataType, PartialFormType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        defaultValue: [],
        minValue: [],
        maxValue: [],
    }),
    validation: (value) => {
        if (!value) {
            return undefined;
        }
        const { minValue, maxValue, defaultValue } = value;

        if (isTruthy(minValue) && isTruthy(maxValue) && minValue >= maxValue) {
            return 'Min value must be less than max value.'; // TODO: use translation
        }
        if (isTruthy(minValue) && isTruthy(defaultValue) && minValue >= defaultValue) {
            return 'Default value must be greater than min value.'; // TODO: use translation
        }
        if (isTruthy(maxValue) && isTruthy(defaultValue) && defaultValue >= maxValue) {
            return 'Default value must be less than max value.'; // TODO: use translation
        }
        return undefined;
    },
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        key: [],
        clientId: [],
        title: [requiredStringCondition],
        widgetId: [],
        order: [],
        width: [],

        properties: dataSchema,
        conditional: [],
        version: [],
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
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Default Value"
                name="defaultValue"
                value={value?.defaultValue}
                onChange={onFieldChange}
                error={error?.defaultValue}
            />
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Min Value"
                name="minValue"
                value={value?.minValue}
                onChange={onFieldChange}
                error={error?.minValue}
            />
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Max Value"
                name="maxValue"
                value={value?.maxValue}
                onChange={onFieldChange}
                error={error?.maxValue}
            />
        </>
    );
}

interface NumberWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}

function NumberWidgetForm(props: NumberWidgetFormProps) {
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
            className={_cs(styles.numberWidgetForm, className)}
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
                    className={styles.input}
                    // FIXME: use translation
                    label="Title"
                    name="title"
                    autoFocus
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
                />
                <DataInput
                    name="properties"
                    value={value.properties}
                    onChange={setFieldValue}
                    error={error?.properties}
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

export default NumberWidgetForm;
