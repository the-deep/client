import React, { useCallback, useEffect } from 'react';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
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

import { Matrix1dWidget, PartialForm } from '../../types';
import styles from './styles.scss';

const ROWS_LIMIT = 20;
const CELLS_LIMIT = 30;

type FormType = Matrix1dWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['data']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'type' | 'order'>;

type RowType = DataType['rows'][number];
export type PartialRowType = PartialForm<
    RowType,
    'clientId' | 'type' | 'order'
>;

type CellType = RowType['cells'][number];
export type PartialCellType = PartialForm<
    CellType,
    'clientId' | 'type' | 'order'
>;

type CellSchema = ObjectSchema<PartialCellType>;
type CellSchemaFields = ReturnType<CellSchema['fields']>;
const cellSchema: CellSchema = {
    fields: (): CellSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type CellsSchema = ArraySchema<PartialCellType>;
type CellsSchemaMember = ReturnType<CellsSchema['member']>;
const cellsSchema: CellsSchema = {
    keySelector: col => col.clientId,
    member: (): CellsSchemaMember => cellSchema,
    validation: (cells) => {
        if ((cells?.length ?? 0) <= 0) {
            return 'At least one cell is required.';
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
        cells: cellsSchema,
        order: [],
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

const defaultCellVal: PartialCellType = {
    clientId: 'random',
    order: -1,
};
interface CellInputProps {
    className?: string;
    value: PartialCellType;
    error: Error<CellType> | undefined;
    onChange: (value: StateArg<PartialCellType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}
function CellInput(props: CellInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultCellVal);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Cell ${index + 1}`;

    return (
        <ExpandableContainer
            className={className}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headerActions={(
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translation
                    title="Remove Cell"
                >
                    <IoTrash />
                </QuickActionButton>
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
}
function RowInput(props: RowInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultRowVal);

    const {
        onValueChange: onCellsChange,
        onValueRemove: onCellsRemove,
    } = useFormArray('cells', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldCells = value.cells ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldCells.length >= CELLS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newCell: PartialCellType = {
                clientId,
                order: oldCells.length,
            };
            onFieldChange(
                [...oldCells, newCell],
                'cells' as const,
            );
        },
        [onFieldChange, value.cells],
    );

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Row ${index + 1}`;

    return (
        <ExpandableContainer
            className={className}
            // NOTE: newly created elements should be open, else closed
            defaultVisibility={!value.label}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headerActions={(
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translation
                    title="Remove Row"
                >
                    <IoTrash />
                </QuickActionButton>
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
                heading="Cells"
                horizontallyCompactContent
                headerActions={(value.cells?.length ?? 0) < CELLS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add Cell"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.cells} />
                {value.cells?.map((cell, cellIndex) => (
                    <CellInput
                        key={cell.clientId}
                        index={cellIndex}
                        value={cell}
                        onChange={onCellsChange}
                        onRemove={onCellsRemove}
                        error={error?.fields?.cells?.members?.[cell.clientId]}
                    />
                ))}
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

    const handleAdd = useCallback(
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
                [...oldRows, newRow],
                'rows' as const,
            );
        },
        [onFieldChange, value?.rows],
    );

    return (
        <>
            <NonFieldError error={error} />
            <Container
                className={className}
                sub
                // FIXME: Use translation
                heading="Rows"
                horizontallyCompactContent
                headerActions={(value?.rows?.length ?? 0) < ROWS_LIMIT && (
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add row"
                    >
                        <IoAdd />
                    </QuickActionButton>
                )}
            >
                <NonFieldError error={error?.fields?.rows} />
                {value?.rows?.map((row, index) => (
                    <RowInput
                        key={row.clientId}
                        index={index}
                        value={row}
                        onChange={onRowsChange}
                        onRemove={onRowsRemove}
                        error={error?.fields?.rows?.members?.[row.clientId]}
                    />
                ))}
            </Container>
        </>
    );
}

interface Matrix1dWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function Matrix1dWidgetForm(props: Matrix1dWidgetFormProps) {
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

export default Matrix1dWidgetForm;
