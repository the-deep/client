import React, { useCallback, useEffect } from 'react';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
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
        order: [],
    }),
};

type OptionsSchema = ArraySchema<PartialOptionType>;
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

type DataSchema = ObjectSchema<PartialDataType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
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
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultOptionVal);

    const error = getErrorObject(riskyError);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Option ${index + 1}`;

    return (
        <ExpandableContainer
            className={className}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            autoFocus={autoFocus}
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
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
                autoFocus
                // FIXME: use translation
                label="Label"
                name="label"
                value={value.label}
                onChange={onFieldChange}
                error={error?.label}
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
    ): OptionInputProps => ({
        onChange: onOptionsChange,
        onRemove: onOptionsRemove,
        error: arrayError?.[key],
        value: option,
        autoFocus: newlyCreatedOptionIdRef.current === option.clientId,
        index,
    }), [
        onOptionsChange,
        onOptionsRemove,
        arrayError,
    ]);
    return (
        <>
            <NonFieldError
                className={styles.error}
                error={error}
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

export default SingleSelectWidgetForm;
