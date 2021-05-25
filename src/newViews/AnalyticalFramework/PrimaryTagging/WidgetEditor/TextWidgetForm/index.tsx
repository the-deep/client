import React, { useCallback, useEffect } from 'react';
import {
    Button,
    TextInput,
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

import { TextWidget, PartialForm } from '../../types';

type FormType = TextWidget;
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
        <div>
            {error?.$internal && (
                <p>
                    {error.$internal}
                </p>
            )}
            <TextInput
                // FIXME: use translation
                label="Default Value"
                name="defaultValue"
                value={value?.defaultValue}
                onChange={onFieldChange}
                error={error?.fields?.defaultValue}
            />
        </div>
    );
}

interface TextWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function TextWidgetForm(props: TextWidgetFormProps) {
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
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <TextInput
                // FIXME: use translation
                label="Title"
                name="title"
                value={value?.title}
                onChange={onValueChange}
                error={error?.fields?.title}
            />
            <DataInput
                name="data"
                value={value.data}
                onChange={onValueChange}
                // eslint-disable-next-line max-len
                error={error?.fields?.data}
            />
            <Button
                name={undefined}
                onClick={onCancel}
                // FIXME: use strings
            >
                Close
            </Button>
            <Button
                name={undefined}
                type="submit"
                disabled={pristine}
                // FIXME: use strings
            >
                Save
            </Button>
        </form>
    );
}

export default TextWidgetForm;
