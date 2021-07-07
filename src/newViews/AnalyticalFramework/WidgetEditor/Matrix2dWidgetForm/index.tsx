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
    StateArg,
    analyzeErrors,
    Error,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import NonFieldError from '#newComponents/ui/NonFieldError';
import SortableList, { NodeRef, Attributes, Listeners } from '#newComponents/ui/SortableList';
import { reorder } from '#utils/safeCommon';

import { Matrix2dWidget, PartialForm } from '../../types';
import styles from './styles.scss';

const ROWS_LIMIT = 20;
const SUB_ROWS_LIMIT = 30;
const COLUMNS_LIMIT = 20;
const SUB_COLUMNS_LIMIT = 30;

type FormType = Matrix2dWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['data']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'type' | 'order'>;

type ColumnType = DataType['columns'][number];
export type PartialColumnType = PartialForm<
    ColumnType,
    'clientId' | 'type' | 'order'
>;

const columnKeySelector = (d: PartialColumnType) => d.clientId;

type SubColumnType = ColumnType['subColumns'][number];
export type PartialSubColumnType = PartialForm<
    SubColumnType,
    'clientId' | 'type' | 'order'
>;

const subColumnKeySelector = (d: PartialSubColumnType) => d.clientId;

type SubColumnSchema = ObjectSchema<PartialSubColumnType>;
type SubColumnSchemaFields = ReturnType<SubColumnSchema['fields']>;
const subColumnSchema: SubColumnSchema = {
    fields: (): SubColumnSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type SubColumnsSchema = ArraySchema<PartialSubColumnType>;
type SubColumnsSchemaMember = ReturnType<SubColumnsSchema['member']>;
const subColumnsSchema: SubColumnsSchema = {
    keySelector: col => col.clientId,
    member: (): SubColumnsSchemaMember => subColumnSchema,
    validation: (subColumns) => {
        if ((subColumns?.length ?? 0) <= 0) {
            return 'At least one sub column is required.';
        }
        return undefined;
    },
};

type ColumnSchema = ObjectSchema<PartialColumnType>;
type ColumnSchemaFields = ReturnType<ColumnSchema['fields']>;
const columnSchema: ColumnSchema = {
    fields: (): ColumnSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        subColumns: subColumnsSchema,
        order: [],
    }),
};

type ColumnsSchema = ArraySchema<PartialColumnType>;
type ColumnsSchemaMember = ReturnType<ColumnsSchema['member']>;
const columnsSchema: ColumnsSchema = {
    keySelector: col => col.clientId,
    member: (): ColumnsSchemaMember => columnSchema,
    /*
    validation: (columns) => {
        if ((columns?.length ?? 0) <= 0) {
            return 'At least one column is required.';
        }
        return undefined;
    },
    */
};

type RowType = DataType['rows'][number];
export type PartialRowType = PartialForm<
    RowType,
    'clientId' | 'type' | 'order'
>;

type SubRowType = RowType['subRows'][number];
export type PartialSubRowType = PartialForm<
    SubRowType,
    'clientId' | 'type' | 'order'
>;

const rowKeySelector = (d: PartialRowType) => d.clientId;
const subRowKeySelector = (d: PartialSubRowType) => d.clientId;

type SubRowSchema = ObjectSchema<PartialSubRowType>;
type SubRowSchemaFields = ReturnType<SubRowSchema['fields']>;
const subRowSchema: SubRowSchema = {
    fields: (): SubRowSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type SubRowsSchema = ArraySchema<PartialSubRowType>;
type SubRowsSchemaMember = ReturnType<SubRowsSchema['member']>;
const subRowsSchema: SubRowsSchema = {
    keySelector: col => col.clientId,
    member: (): SubRowsSchemaMember => subRowSchema,
    validation: (subRows) => {
        if ((subRows?.length ?? 0) <= 0) {
            return 'At least one sub row is required.';
        }
        return undefined;
    },
};

type RowSchema = ObjectSchema<PartialRowType>;
type RowSchemaFields = ReturnType<RowSchema['fields']>;
const rowSchema: RowSchema = {
    fields: (): RowSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        color: [],
        order: [],
        subRows: subRowsSchema,
    }),
};

type RowsSchema = ArraySchema<PartialRowType>;
type RowsSchemaMember = ReturnType<RowsSchema['member']>;
const rowsSchema: RowsSchema = {
    keySelector: col => col.clientId,
    member: (): RowsSchemaMember => rowSchema,
    validation: (rows) => {
        if ((rows?.length ?? 0) <= 0) {
            return 'At least one row is required.';
        }
        return undefined;
    },
};

type DataSchema = ObjectSchema<PartialDataType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        rows: rowsSchema,
        columns: columnsSchema,
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

const defaultSubRowVal: PartialSubRowType = {
    clientId: 'random',
    order: -1,
};
interface SubRowInputProps {
    className?: string;
    value: PartialSubRowType;
    error: Error<SubRowType> | undefined;
    onChange: (value: StateArg<PartialSubRowType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
}
function SubRowInput(props: SubRowInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultSubRowVal);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Sub Row ${index + 1}`;

    return (
        <ExpandableContainer
            className={className}
            containerElementProps={{
                ref: setNodeRef,
                style,
            }}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            expansionTriggerArea="arrow"
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Sub Row"
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
                error={error?.fields?.label}
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

const defaultRowVal: PartialRowType = {
    clientId: 'random',
    order: -1,
};
interface RowInputProps {
    className?: string;
    value: PartialRowType;
    error: Error<RowType> | undefined;
    onChange: (value: StateArg<PartialRowType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
}
function RowInput(props: RowInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultRowVal);

    const {
        onValueChange: onSubRowsChange,
        onValueRemove: onSubRowsRemove,
    } = useFormArray('subRows', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldSubRows = value.subRows ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSubRows.length >= SUB_ROWS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newSubRow: PartialSubRowType = {
                clientId,
                order: oldSubRows.length,
            };
            onFieldChange(
                [...reorder(oldSubRows), newSubRow],
                'subRows' as const,
            );
        },
        [onFieldChange, value.subRows],
    );

    const handleSubRowsOrderChange = useCallback((newSubRows: PartialSubRowType[]) => {
        onFieldChange(reorder(newSubRows), 'subRows');
    }, [onFieldChange]);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Row ${index + 1}`;

    const subRowRendererParams = useCallback(
        (
            key: string,
            data: PartialSubRowType,
            subRowIndex: number,
        ) => ({
            index: subRowIndex,
            value: data,
            onChange: onSubRowsChange,
            onRemove: onSubRowsRemove,
            error: error?.fields?.subRows?.members?.[key],
        }),
        [onSubRowsChange, onSubRowsRemove, error?.fields?.subRows?.members],
    );

    return (
        <ExpandableContainer
            containerElementProps={{
                ref: setNodeRef,
                style,
            }}
            className={className}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            expansionTriggerArea="arrow"
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Row"
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
                error={error?.fields?.label}
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
            <Container
                className={className}
                sub
                heading="Sub Rows"
                horizontallyCompactContent
                headerActions={(value.subRows?.length ?? 0) < SUB_ROWS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add Sub Row"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.subRows} />
                <SortableList
                    name="subRows"
                    onChange={handleSubRowsOrderChange}
                    data={value.subRows}
                    keySelector={subRowKeySelector}
                    renderer={SubRowInput}
                    rendererParams={subRowRendererParams}
                    direction="vertical"
                />
            </Container>
        </ExpandableContainer>
    );
}

const defaultSubColumnVal: PartialSubColumnType = {
    clientId: 'random',
    order: -1,
};
interface SubColumnInputProps {
    className?: string;
    value: PartialSubColumnType;
    error: Error<SubColumnType> | undefined;
    onChange: (value: StateArg<PartialSubColumnType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
}
function SubColumnInput(props: SubColumnInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultSubColumnVal);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Sub Column ${index + 1}`;

    return (
        <ExpandableContainer
            className={className}
            containerElementProps={{
                ref: setNodeRef,
                style,
            }}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            expansionTriggerArea="arrow"
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Sub Column"
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
                error={error?.fields?.label}
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

const defaultColumnVal: PartialColumnType = {
    clientId: 'random',
    order: -1,
};
interface ColumnInputProps {
    className?: string;
    value: PartialColumnType;
    error: Error<ColumnType> | undefined;
    onChange: (value: StateArg<PartialColumnType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
}
function ColumnInput(props: ColumnInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultColumnVal);

    const {
        onValueChange: onSubColumnsChange,
        onValueRemove: onSubColumnsRemove,
    } = useFormArray('subColumns', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldSubColumns = value.subColumns ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSubColumns.length >= SUB_COLUMNS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newSubColumn: PartialSubColumnType = {
                clientId,
                order: oldSubColumns.length,
            };
            onFieldChange(
                [...reorder(oldSubColumns), newSubColumn],
                'subColumns' as const,
            );
        },
        [onFieldChange, value.subColumns],
    );

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Column ${index + 1}`;

    const handleSubColumnOrderChange = useCallback((newSubColumns: PartialSubColumnType[]) => {
        onFieldChange(reorder(newSubColumns), 'subColumns');
    }, [onFieldChange]);

    const subColumnRendererParams = useCallback(
        (
            key: string,
            data: PartialSubColumnType,
            subColumnIndex: number,
        ) => ({
            index: subColumnIndex,
            value: data,
            onChange: onSubColumnsChange,
            onRemove: onSubColumnsRemove,
            error: error?.fields?.subColumns?.members?.[key],
        }),
        [onSubColumnsChange, onSubColumnsRemove, error?.fields?.subColumns?.members],
    );

    return (
        <ExpandableContainer
            className={className}
            containerElementProps={{
                ref: setNodeRef,
                style,
            }}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            expansionTriggerArea="arrow"
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Column"
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
                error={error?.fields?.label}
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
            <Container
                className={className}
                sub
                heading="Sub Columns"
                horizontallyCompactContent
                headerActions={(value.subColumns?.length ?? 0) < SUB_COLUMNS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add Sub Column"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.subColumns} />
                <SortableList
                    name="subColumns"
                    onChange={handleSubColumnOrderChange}
                    data={value.subColumns}
                    keySelector={subColumnKeySelector}
                    renderer={SubColumnInput}
                    rendererParams={subColumnRendererParams}
                    direction="vertical"
                />
            </Container>
        </ExpandableContainer>
    );
}

const defaultVal: PartialDataType = {};

interface DataInputProps<K extends string>{
    name: K;
    value: PartialDataType | undefined;
    error: Error<PartialDataType> | undefined;
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
        onValueChange: onRowsChange,
        onValueRemove: onRowsRemove,
    } = useFormArray('rows', onFieldChange);

    const handleRowAdd = useCallback(
        () => {
            const oldRows = value?.rows ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldRows.length >= ROWS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newRow: PartialRowType = {
                clientId,
                order: oldRows.length,
            };
            onFieldChange(
                [...reorder(oldRows), newRow],
                'rows' as const,
            );
        },
        [onFieldChange, value?.rows],
    );

    const {
        onValueChange: onColumnsChange,
        onValueRemove: onColumnsRemove,
    } = useFormArray('columns', onFieldChange);

    const columnRendererParams = useCallback(
        (
            key: string,
            data: PartialColumnType,
            index: number,
        ) => ({
            index,
            value: data,
            onChange: onColumnsChange,
            onRemove: onColumnsRemove,
            error: error?.fields?.columns?.members?.[key],
        }),
        [onColumnsChange, onColumnsRemove, error?.fields?.columns?.members],
    );

    const rowRendererParams = useCallback(
        (
            key: string,
            data: PartialRowType,
            index: number,
        ) => ({
            index,
            value: data,
            onChange: onRowsChange,
            onRemove: onRowsRemove,
            error: error?.fields?.rows?.members?.[key],
        }),
        [onRowsChange, onRowsRemove, error?.fields?.rows?.members],
    );

    const handleRowsOrderChange = useCallback((newRows: PartialRowType[]) => {
        onFieldChange(reorder(newRows), 'rows');
    }, [onFieldChange]);

    const handleColumnsOrderChange = useCallback((newColumns: PartialColumnType[]) => {
        onFieldChange(reorder(newColumns), 'columns');
    }, [onFieldChange]);

    const handleColumnAdd = useCallback(
        () => {
            const oldColumns = value?.columns ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldColumns.length >= COLUMNS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newColumn: PartialColumnType = {
                clientId,
                order: -1,
            };
            onFieldChange(
                [...reorder(oldColumns), newColumn],
                'columns' as const,
            );
        },
        [onFieldChange, value?.columns],
    );

    return (
        <>
            <NonFieldError error={error} />
            <Container
                className={className}
                sub
                heading="Rows"
                horizontallyCompactContent
                headerActions={(value?.rows?.length ?? 0) < ROWS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleRowAdd}
                        // FIXME: use strings
                        title="Add row"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.rows} />
                <SortableList
                    name="rows"
                    onChange={handleRowsOrderChange}
                    data={value?.rows}
                    keySelector={rowKeySelector}
                    renderer={RowInput}
                    rendererParams={rowRendererParams}
                    direction="vertical"
                />
            </Container>
            <Container
                className={className}
                sub
                heading="Columns"
                horizontallyCompactContent
                headerActions={(value?.columns?.length ?? 0) < COLUMNS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleColumnAdd}
                        // FIXME: use strings
                        title="Add column"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.columns} />
                <SortableList
                    name="columns"
                    onChange={handleColumnsOrderChange}
                    data={value?.columns}
                    keySelector={columnKeySelector}
                    renderer={ColumnInput}
                    rendererParams={columnRendererParams}
                    direction="vertical"
                />
            </Container>
        </>
    );
}

interface Matrix2dWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function Matrix2dWidgetForm(props: Matrix2dWidgetFormProps) {
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
            <Container
                heading={value.title ?? 'Unnamed'}
                horizontallyCompactContent
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

export default Matrix2dWidgetForm;
