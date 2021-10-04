import React, { useCallback, useEffect, useState } from 'react';
import {
    IoTrashBinOutline,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
    Checkbox,
    SelectInput,
    TextInput,
    QuickActionButton,
    ControlledExpandableContainer,
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
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import SortableList, { Attributes, Listeners } from '#components/SortableList';
import { isValidColor, reorder } from '#utils/common';

import WidgetSizeInput from '../../WidgetSizeInput';
import { ScaleWidget } from '#types/newAnalyticalFramework';
import styles from './styles.css';

const OPTIONS_LIMIT = 20;

type FormType = ScaleWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['properties']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'key' | 'widgetId' | 'order'>;

type OptionType = DataType['options'][number];
export type PartialOptionType = PartialForm<
    OptionType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type OptionSchema = ObjectSchema<PartialOptionType, PartialFormType>;
type OptionSchemaFields = ReturnType<OptionSchema['fields']>;
const optionSchema: OptionSchema = {
    fields: (): OptionSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        color: [isValidColor],
        order: [],
    }),
};

type OptionsSchema = ArraySchema<PartialOptionType, PartialFormType>;
type OptionsSchemaMember = ReturnType<OptionsSchema['member']>;
const optionsSchema: OptionsSchema = {
    keySelector: (col) => col.clientId,
    member: (): OptionsSchemaMember => optionSchema,
    validation: (options) => {
        if ((options?.length ?? 0) <= 0) {
            return 'At least one option is required.';
        }
        return undefined;
    },
};

type DataSchema = ObjectSchema<PartialDataType, PartialFormType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        defaultValue: [requiredStringCondition],
        options: optionsSchema,
    }),
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
    autoFocus?: boolean;
    expanded?: boolean;
    onExpansionChange: (scaleExpanded: boolean, scaleId: string) => void;
}

function OptionInput(props: OptionInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        isDefault,
        clientId,
        onDefaultValueChange,
        listeners,
        attributes,
        autoFocus,
        expanded,
        onExpansionChange,
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
        <ControlledExpandableContainer
            name={value.clientId}
            className={className}
            // NOTE: newly created elements should be open, else closed
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            autoFocus={autoFocus}
            expansionTriggerArea="arrow"
            onExpansionChange={onExpansionChange}
            expanded={expanded}
            headingSize="extraSmall"
            withoutBorder
            spacing="comfortable"
            headerIcons={(
                <QuickActionButton
                    name={index}
                    // FIXME: use translation
                    title="Drag"
                    {...attributes}
                    {...listeners}
                >
                    <GrDrag />
                </QuickActionButton>
            )}
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
                        <IoTrashBinOutline />
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
        </ControlledExpandableContainer>
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
        error: riskyError,
        onChange,
        name,
        className,
    } = props;

    const [expandedScaleId, setExpandedScaleId] = useState<string | undefined>();
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

    const handleExpansionChange = useCallback((scaleExpanded: boolean, scaleId: string) => {
        setExpandedScaleId(scaleExpanded ? scaleId : undefined);
    }, []);

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
        onExpansionChange: handleExpansionChange,
        expanded: expandedScaleId === option.clientId,
    }), [
        onOptionsChange,
        handleOptionRemove,
        handleDefaultValueChange,
        value?.defaultValue,
        arrayError,
        expandedScaleId,
        handleExpansionChange,
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
                className={_cs(className, styles.listContainer)}
                heading="Options"
                headingSize="extraSmall"
                withoutExternalPadding
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
                    className={styles.sortableList}
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
                className={styles.container}
                heading={value.title ?? 'Unnamed'}
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
                    name="properties"
                    value={value.properties}
                    onChange={setFieldValue}
                    error={error?.properties}
                />
            </Container>
        </form>
    );
}

export default ScaleWidgetForm;
