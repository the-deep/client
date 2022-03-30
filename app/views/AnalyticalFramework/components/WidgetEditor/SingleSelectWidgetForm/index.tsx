import React, { useCallback, useEffect, useState } from 'react';
import {
    IoTrashBinOutline,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
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
    randomString,
    _cs,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import SortableList, { Attributes, Listeners } from '#components/SortableList';
import { reorder } from '#utils/common';

import WidgetSizeInput from '../../WidgetSizeInput';
import { SingleSelectWidget } from '#types/newAnalyticalFramework';
import styles from './styles.css';

const OPTIONS_LIMIT = 100;

type FormType = SingleSelectWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['properties']>>;
export type PartialDataType = PartialForm<DataType, 'key' | 'widgetId' | 'order'>;

type OptionType = DataType['options'][number];
export type PartialOptionType = PartialForm<
    OptionType,
    'key' | 'widgetId' | 'order'
>;

type OptionSchema = ObjectSchema<PartialOptionType, PartialFormType>;
type OptionSchemaFields = ReturnType<OptionSchema['fields']>;
const optionSchema: OptionSchema = {
    fields: (): OptionSchemaFields => ({
        key: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type OptionsSchema = ArraySchema<PartialOptionType, PartialFormType>;
type OptionsSchemaMember = ReturnType<OptionsSchema['member']>;
const optionsSchema: OptionsSchema = {
    keySelector: (col) => col.key,
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
        conditional: [],
        version: [],
    }),
};

const defaultOptionVal = (): PartialOptionType => ({
    key: `auto-${randomString()}`,
    order: -1,
});

const optionKeySelector = (o: PartialOptionType) => o.key;

interface OptionInputProps {
    className?: string;
    value: PartialOptionType;
    error: Error<OptionType> | undefined;
    onChange: (value: SetValueArg<PartialOptionType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    autoFocus?: boolean;
    onExpansionChange: (optionExpanded: boolean, optionId: string) => void;
    expanded?: boolean;
}

function OptionInput(props: OptionInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        autoFocus,
        onExpansionChange,
        expanded,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultOptionVal);

    const error = getErrorObject(riskyError);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Option ${index + 1}`;

    return (
        <ControlledExpandableContainer
            name={value.key}
            className={className}
            // NOTE: newly created elements should be open, else closed
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            spacing="comfortable"
            autoFocus={autoFocus}
            expanded={expanded}
            onExpansionChange={onExpansionChange}
            withoutBorder
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
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translation
                    title="Remove Option"
                >
                    <IoTrashBinOutline />
                </QuickActionButton>
            )}
        >
            <NonFieldError error={error} />
            <TextInput
                autoFocus={autoFocus}
                // FIXME: use translation
                label="Label"
                name="label"
                value={value.label}
                onChange={onFieldChange}
                error={error?.label}
                className={styles.optionInput}
            />
            {/*
                NOTE: We'll need to remove tooltip from types later
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
            */}
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

    const [expandedOptionId, setExpandedOptionId] = useState<string | undefined>();
    const onFieldChange = useFormObject(name, onChange, defaultVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.options);

    const {
        setValue: onOptionsChange,
        removeValue: onOptionsRemove,
    } = useFormArray('options', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldOptions = value?.options ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldOptions.length >= OPTIONS_LIMIT) {
                return;
            }

            const key = randomString();
            newlyCreatedOptionIdRef.current = key;
            const newOption: PartialOptionType = {
                key,
                order: oldOptions.length + 1,
            };
            setExpandedOptionId(newOption.key);
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

    const handleExpansionChange = useCallback((optionExpanded: boolean, optionId: string) => {
        setExpandedOptionId(optionExpanded ? optionId : undefined);
    }, []);

    const optionRendererParams = useCallback((
        key: string,
        option: PartialOptionType,
        index: number,
    ): OptionInputProps => ({
        onChange: onOptionsChange,
        onRemove: onOptionsRemove,
        error: arrayError?.[key],
        value: option,
        autoFocus: newlyCreatedOptionIdRef.current === option.key,
        index,
        onExpansionChange: handleExpansionChange,
        expanded: expandedOptionId === option.key,
    }), [
        onOptionsChange,
        onOptionsRemove,
        arrayError,
        expandedOptionId,
        handleExpansionChange,
    ]);
    return (
        <>
            <NonFieldError
                className={styles.error}
                error={error}
            />
            <Container
                className={_cs(className, styles.listContainer)}
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
                    className={styles.sortableList}
                    onChange={handleOrderChange}
                    data={value?.options}
                    keySelector={optionKeySelector}
                    renderer={OptionInput}
                    direction="vertical"
                    rendererParams={optionRendererParams}
                    showDragOverlay
                    emptyMessage="No options were found."
                    messageShown
                    messageIconShown
                />
            </Container>
        </>
    );
}

interface SingleSelectWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}

function SingleSelectWidgetForm(props: SingleSelectWidgetFormProps) {
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
            className={_cs(styles.singleSelectWidgetForm, className)}
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

export default SingleSelectWidgetForm;
