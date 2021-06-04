import React, { useCallback, useEffect } from 'react';
import {
    Button,
    TextInput,
    DateInput,
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
import { _cs } from '@togglecorp/fujs';

import NonFieldError from '#components/ui/NonFieldError';

import { DateWidget, PartialForm } from '../../types';
import styles from './styles.scss';

type FormType = DateWidget;
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
    className?: string;
}
function DataInput<K extends string>(props: DataInputProps<K>) {
    const {
        value,
        error,
        onChange,
        name,
        className,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultVal);

    return (
        <div
            className={_cs(className, styles.data)}
        >
            <NonFieldError error={error} />
            <DateInput
                className={styles.input}
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

interface DateWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function DateWidgetForm(props: DateWidgetFormProps) {
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
            className={styles.widgetEdit}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <div className={styles.buttonContainer}>
                <Button
                    className={styles.button}
                    name={undefined}
                    onClick={onCancel}
                    variant="tertiary"
                    // FIXME: use strings
                >
                    Cancel
                </Button>
                <Button
                    className={styles.button}
                    name={undefined}
                    type="submit"
                    disabled={pristine}
                    // FIXME: use strings
                >
                    Save
                </Button>
            </div>
            <NonFieldError error={error} />
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
                // eslint-disable-next-line max-len
                error={error?.fields?.data}
            />
        </form>
    );
}

export default DateWidgetForm;
