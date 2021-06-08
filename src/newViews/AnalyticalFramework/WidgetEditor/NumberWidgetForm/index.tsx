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
    StateArg,
    Error,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { isTruthy } from '@togglecorp/fujs';

import NonFieldError from '#components/ui/NonFieldError';

import { NumberWidget, PartialForm } from '../../types';
import styles from './styles.scss';

type FormType = NumberWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type'
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
        minValue: [],
        maxValue: [],
    }),
    validation: (value) => {
        const { minValue, maxValue } = value ?? {};
        if (isTruthy(minValue) && isTruthy(maxValue) && minValue >= maxValue) {
            return 'Min value must be less than max value.'; // TODO: use translation
        }
        return undefined;
    },
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
    error: Error<DataType> | undefined;
    onChange: (value: StateArg<PartialDataType | undefined>, name: K) => void;
}
function DataInput<K extends string>(props: DataInputProps<K>) {
    const {
        value,
        error,
        onChange,
        name,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultVal);

    return (
        <>
            <NonFieldError
                className={styles.input}
                error={error}
            />
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Default Value"
                name="defaultValue"
                value={value?.defaultValue}
                onChange={onFieldChange}
                error={error?.fields?.defaultValue}
            />
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Min Value"
                name="minValue"
                value={value?.minValue}
                onChange={onFieldChange}
                error={error?.fields?.minValue}
            />
            <NumberInput
                className={styles.input}
                // FIXME: use translation
                label="Max Value"
                name="maxValue"
                value={value?.maxValue}
                onChange={onFieldChange}
                error={error?.fields?.maxValue}
            />
        </>
    );
}

interface NumberWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function NumberWidgetForm(props: NumberWidgetFormProps) {
    const {
        onChange,
        onSave,
        onCancel,
        initialValue,
    } = props;

    const {
        pristine,
        value,
        error,
        validate,
        onValueChange,
        onErrorSet,
    } = useForm(initialValue, schema);

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
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
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
                footerContent={(
                    <NonFieldError error={error} />
                )}
                horizontallyCompactContent
                sub
            >
                <TextInput
                    className={styles.input}
                    // FIXME: use translation
                    label="Title"
                    name="title"
                    value={value.title}
                    onChange={onValueChange}
                    error={error?.fields?.title}
                />
                <DataInput
                    name="data"
                    value={value.data}
                    onChange={onValueChange}
                    error={error?.fields?.data}
                />
            </Container>
        </form>
    );
}

export default NumberWidgetForm;
