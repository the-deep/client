import React, { useCallback, useEffect } from 'react';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import {
    Button,
    Checkbox,
    SelectInput,
    TextInput,
    TextArea,
    QuickActionButton,
    ExpandableContainer,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    ArraySchema,
    useForm,
    useFormObject,
    useFormArray,
    createSubmitHandler,
    StateArg,
    analyzeErrors,
    Error,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import {
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/ui/NonFieldError';
import { isValidColor } from '#utils/safeCommon';

import { ScaleWidget, PartialForm } from '../../types';
import styles from './styles.scss';

const OPTIONS_LIMIT = 20;

type FormType = ScaleWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['data']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'type'>;

type OptionType = DataType['options'][number];
export type PartialOptionType = PartialForm<
    OptionType,
    'clientId' | 'type'
>;

type OptionSchema = ObjectSchema<PartialOptionType>;
type OptionSchemaFields = ReturnType<OptionSchema['fields']>;
const optionSchema: OptionSchema = {
    fields: (): OptionSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        color: [isValidColor],
    }),
};

type OptionsSchema = ArraySchema<PartialOptionType>;
type OptionsSchemaMember = ReturnType<OptionsSchema['member']>;
const optionsSchema: OptionsSchema = {
    keySelector: col => col.clientId,
    member: (): OptionsSchemaMember => optionSchema,
    validation: (options) => {
        if ((options?.length ?? 0) <= 0) {
            return 'At least one option is required.';
        }
        return undefined;
    },
};

type DataSchema = ObjectSchema<PartialDataType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        defaultValue: [requiredStringCondition],
        options: optionsSchema,
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

const defaultOptionVal: PartialOptionType = {
    clientId: 'random',
};

const optionKeySelector = (o: PartialOptionType) => o.clientId;
const optionLabelSelector = (o: PartialOptionType) => o.label ?? 'Unnamed';

interface OptionInputProps {
    className?: string;
    value: PartialOptionType;
    error: Error<OptionType> | undefined;
    onChange: (value: StateArg<PartialOptionType>, index: number) => void;
    onRemove: (index: number, isDefault: boolean) => void;
    index: number;
    isDefault: boolean;
    clientId: string;
    onDefaultValueChange: (clientId: string | undefined) => void;
}
function OptionInput(props: OptionInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        isDefault,
        clientId,
        onDefaultValueChange,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultOptionVal);

    const handleRemove = useCallback(() => {
        onRemove(index, isDefault);
    }, [onRemove, index, isDefault]);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Option ${index + 1}`;

    const handleCheckboxChange = useCallback((newVal: boolean) => {
        if (newVal) {
            onDefaultValueChange(clientId);
        } else {
            onDefaultValueChange(undefined);
        }
    }, [onDefaultValueChange, clientId]);

    return (
        <ExpandableContainer
            className={className}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headerActions={(
                <>
                    <Checkbox
                        value={isDefault}
                        label="Default"
                        name="default-checkbox"
                        onChange={handleCheckboxChange}
                    />
                    <QuickActionButton
                        name={index}
                        onClick={handleRemove}
                        // FIXME: use translation
                        title="Remove Option"
                    >
                        <IoTrash />
                    </QuickActionButton>
                </>
            )}
        >
            <NonFieldError error={error} />
            <TextInput
                // FIXME: use translation
                label="Label"
                name="label"
                value={value.label}
                onChange={onFieldChange}
                error={error?.fields?.label}
            />
            <TextInput
                // FIXME: use translation
                label="Color"
                name="color"
                value={value.color}
                onChange={onFieldChange}
                error={error?.fields?.color}
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.fields?.tooltip}
            />
        </ExpandableContainer>
    );
}

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

    const {
        onValueChange: onOptionsChange,
        onValueRemove: onOptionsRemove,
    } = useFormArray('options', onFieldChange);

    const handleDefaultValueChange = useCallback((newDefaultValue?: string) => {
        onFieldChange(newDefaultValue, 'defaultValue');
    }, [onFieldChange]);

    const handleOptionRemove = useCallback((index: number, isDefault: boolean) => {
        if (isDefault) {
            onFieldChange(undefined, 'defaultValue');
        }
        onOptionsRemove(index);
    }, [onOptionsRemove, onFieldChange]);

    const handleAdd = useCallback(
        () => {
            const oldOptions = value?.options ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldOptions.length >= OPTIONS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newOption: PartialOptionType = {
                clientId,
            };
            onFieldChange(
                [...oldOptions, newOption],
                'options' as const,
            );
        },
        [onFieldChange, value?.options],
    );

    return (
        <>
            <NonFieldError
                className={styles.error}
                error={error}
            />
            <SelectInput
                className={styles.input}
                // FIXME: Use string
                label="Default Value"
                name="defaultValue"
                value={value?.defaultValue}
                onChange={onFieldChange}
                options={value?.options}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                error={error?.fields?.defaultValue}
                readOnly
            />
            <Container
                className={className}
                sub
                heading="Options"
                contentClassName={styles.optionsList}
                headerActions={(value?.options?.length ?? 0) < OPTIONS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add option"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.options} />
                {value?.options?.map((option, index) => (
                    <OptionInput
                        clientId={option.clientId}
                        key={option.clientId}
                        index={index}
                        value={option}
                        onChange={onOptionsChange}
                        onRemove={handleOptionRemove}
                        error={error?.fields?.options?.members?.[option.clientId]}
                        isDefault={value?.defaultValue === option.clientId}
                        onDefaultValueChange={handleDefaultValueChange}
                    />
                ))}
            </Container>
        </>
    );
}

interface ScaleWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function ScaleWidgetForm(props: ScaleWidgetFormProps) {
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
                heading={value.title ?? 'Unnamed'}
                horizontallyCompactContent
                contentClassName={styles.editorContent}
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
                <NonFieldError error={error} />
                <TextInput
                    className={styles.input}
                    // FIXME: use translation
                    label="Title"
                    name="title"
                    autoFocus
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

export default ScaleWidgetForm;
