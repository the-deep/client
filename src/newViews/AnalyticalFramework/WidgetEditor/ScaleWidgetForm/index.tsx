import React, { useCallback, useEffect } from 'react';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
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
    SetValueArg,
    analyzeErrors,
    Error,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#newComponents/ui/NonFieldError';
import SortableList, { NodeRef, Attributes, Listeners } from '#newComponents/ui/SortableList';
import { isValidColor, reorder } from '#utils/safeCommon';

import WidgetSizeInput from '../../WidgetSizeInput';
import { ScaleWidget } from '../../types';
import styles from './styles.scss';

const OPTIONS_LIMIT = 20;

type FormType = ScaleWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['data']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'type' | 'order'>;

type OptionType = DataType['options'][number];
export type PartialOptionType = PartialForm<
    OptionType,
    'clientId' | 'type' | 'order'
>;

type OptionSchema = ObjectSchema<PartialOptionType>;
type OptionSchemaFields = ReturnType<OptionSchema['fields']>;
const optionSchema: OptionSchema = {
    fields: (): OptionSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        color: [isValidColor],
        order: [],
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
    order: -1,
};

const optionKeySelector = (o: PartialOptionType) => o.clientId;
const optionLabelSelector = (o: PartialOptionType) => o.label ?? 'Unnamed';

interface OptionInputProps {
    className?: string;
    value: PartialOptionType;
    error: Error<OptionType> | undefined;
    onChange: (value: SetValueArg<PartialOptionType>, index: number) => void;
    onRemove: (index: number, isDefault: boolean) => void;
    index: number;
    isDefault: boolean;
    clientId: string;
    onDefaultValueChange: (clientId: string | undefined) => void;
    listeners?: Listeners,
    attributes?: Attributes,
    setNodeRef?: NodeRef,
    style?: React.CSSProperties,
    autoFocus?: boolean;
}

function OptionInput(props: OptionInputProps) {
    const {
        className,
        value,
        // FIXME: use proper variable name
        // suggestion: errorFromProps
        error: riskyError,
        onChange,
        onRemove,
        index,
        isDefault,
        clientId,
        onDefaultValueChange,
        listeners,
        attributes,
        setNodeRef,
        style,
        autoFocus,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultOptionVal);

    const error = getErrorObject(riskyError);

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
        <div
            ref={setNodeRef}
            style={style}
        >
            <ExpandableContainer
                className={className}
                // NOTE: newly created elements should be open, else closed
                defaultVisibility={!value.label}
                // FIXME: use strings
                heading={`${heading} ${errored ? '*' : ''}`}
                autoFocus={autoFocus}
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
                        <QuickActionButton
                            name={index}
                            // FIXME: use translation
                            title="Drag"
                            {...attributes}
                            {...listeners}
                        >
                            <GrDrag />
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
                    error={error?.label}
                    autoFocus={autoFocus}
                    className={styles.optionInput}
                />
                <TextInput
                    // FIXME: use translation
                    label="Color"
                    name="color"
                    value={value.color}
                    onChange={onFieldChange}
                    error={error?.color}
                    className={styles.optionInput}
                />
                <TextArea
                    // FIXME: use translation
                    label="Tooltip"
                    name="tooltip"
                    rows={2}
                    value={value.tooltip}
                    onChange={onFieldChange}
                    error={error?.tooltip}
                    className={styles.optionInput}
                />
            </ExpandableContainer>
        </div>
    );
}

const defaultVal: PartialDataType = {};

interface DataInputProps<K extends string>{
    name: K;
    value: PartialDataType | undefined;
    error: Error<DataType> | undefined;
    onChange: (value: SetValueArg<PartialDataType | undefined>, name: K) => void;
    className?: string;
}
function DataInput<K extends string>(props: DataInputProps<K>) {
    const {
        value,
        // FIXME: use proper variable name
        error: riskyError,
        onChange,
        name,
        className,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.options);

    const {
        setValue: onOptionsChange,
        removeValue: onOptionsRemove,
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
            newlyCreatedOptionIdRef.current = clientId;
            const newOption: PartialOptionType = {
                clientId,
                order: oldOptions.length,
            };
            onFieldChange(
                [...reorder(oldOptions), newOption],
                'options' as const,
            );
        },
        [onFieldChange, value?.options],
    );

    const handleOrderChange = useCallback((
        newValues: PartialOptionType[],
    ) => {
        onFieldChange(reorder(newValues), 'options');
    }, [onFieldChange]);

    const optionRendererParams = useCallback((
        key: string,
        option: PartialOptionType,
        index: number,
    ) : OptionInputProps => ({
        onChange: onOptionsChange,
        onRemove: handleOptionRemove,
        onDefaultValueChange: handleDefaultValueChange,
        error: arrayError?.[key],
        value: option,
        clientId: key,
        isDefault: value?.defaultValue === key,
        index,
        autoFocus: newlyCreatedOptionIdRef.current === option.clientId,
    }), [
        onOptionsChange,
        handleOptionRemove,
        handleDefaultValueChange,
        value?.defaultValue,
        arrayError,
    ]);

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
                error={error?.defaultValue}
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
                <NonFieldError error={error?.options} />
                <SortableList
                    name="options"
                    onChange={handleOrderChange}
                    data={value?.options}
                    keySelector={optionKeySelector}
                    renderer={OptionInput}
                    direction="vertical"
                    rendererParams={optionRendererParams}
                    showDragOverlay
                />
            </Container>
        </>
    );
}

interface ScaleWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}

function ScaleWidgetForm(props: ScaleWidgetFormProps) {
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
            className={_cs(styles.scaleWidgetForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
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
                <DataInput
                    name="data"
                    value={value.data}
                    onChange={setFieldValue}
                    error={error?.data}
                />
            </Container>
        </form>
    );
}

export default ScaleWidgetForm;
