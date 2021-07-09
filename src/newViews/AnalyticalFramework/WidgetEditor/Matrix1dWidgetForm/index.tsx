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
import { randomString } from '@togglecorp/fujs';

import NonFieldError from '#newComponents/ui/NonFieldError';
import SortableList, { NodeRef, Attributes, Listeners } from '#newComponents/ui/SortableList';
import { reorder } from '#utils/safeCommon';

import { Matrix1dWidget } from '../../types';
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

const rowKeySelector = (row: PartialRowType) => row.clientId;
const cellKeySelector = (cell: PartialCellType) => cell.clientId;

interface CellInputProps {
    className?: string;
    value: PartialCellType;
    error: Error<CellType> | undefined;
    onChange: (value: SetValueArg<PartialCellType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
    autoFocus?: boolean;
}

function CellInput(props: CellInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
        autoFocus,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(index, onChange, defaultCellVal);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Cell ${index + 1}`;

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
                        <QuickActionButton
                            name={index}
                            onClick={onRemove}
                            // FIXME: use translation
                            title="Remove Cell"
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
                    autoFocus={autoFocus}
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
        </div>
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
    onChange: (value: SetValueArg<PartialRowType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
    autoFocus?: boolean;
}
function RowInput(props: RowInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        setNodeRef,
        style,
        autoFocus,
    } = props;

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.cells);

    const onFieldChange = useFormObject(index, onChange, defaultRowVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const {
        setValue: onCellsChange,
        removeValue: onCellsRemove,
    } = useFormArray('cells', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldCells = value.cells ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldCells.length >= CELLS_LIMIT) {
                return;
            }

            const clientId = randomString();
            newlyCreatedOptionIdRef.current = clientId;
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

    const handleOrderChange = useCallback((
        newValues: PartialCellType[],
    ) => {
        onFieldChange(reorder(newValues), 'cells');
    }, [onFieldChange]);

    const cellRendererParams = useCallback((
        key: string,
        cell: PartialCellType,
    ): CellInputProps => ({
        onChange: onCellsChange,
        onRemove: onCellsRemove,
        error: arrayError?.[key],
        value: cell,
        autoFocus: newlyCreatedOptionIdRef.current === cell.clientId,
        index,
    }), [
        onCellsChange,
        onCellsRemove,
        arrayError,
        index,
    ]);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Row ${index + 1}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
        >
            <ExpandableContainer
                autoFocus={autoFocus}
                className={className}
                // NOTE: newly created elements should be open, else closed
                defaultVisibility={!value.label}
                // FIXME: use strings
                heading={`${heading} ${errored ? '*' : ''}`}
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
                    autoFocus={autoFocus}
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
                <Container
                    className={styles.optionInput}
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
                    <NonFieldError error={error?.cells} />
                    <SortableList
                        name="cells"
                        onChange={handleOrderChange}
                        data={value?.cells}
                        keySelector={cellKeySelector}
                        renderer={CellInput}
                        direction="vertical"
                        rendererParams={cellRendererParams}
                        showDragOverlay
                    />
                </Container>
            </ExpandableContainer>
        </div>
    );
}

const defaultVal: PartialDataType = {};

interface DataInputProps<K extends string>{
    name: K;
    value: PartialDataType | undefined;
    error: Error<PartialDataType> | undefined;
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

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.rows);

    const onFieldChange = useFormObject(name, onChange, defaultVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const {
        setValue: onRowsChange,
        removeValue: onRowsRemove,
    } = useFormArray('rows', onFieldChange);

    const handleAdd = useCallback(
        () => {
            const oldRows = value?.rows ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldRows.length >= ROWS_LIMIT) {
                return;
            }

            const clientId = randomString();
            newlyCreatedOptionIdRef.current = clientId;
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

    const handleOrderChange = useCallback((
        newValues: PartialRowType[],
    ) => {
        onFieldChange(reorder(newValues), 'rows');
    }, [onFieldChange]);

    const rowRendererParams = useCallback((
        key: string,
        row: PartialRowType,
        index: number,
    ): RowInputProps => ({
        onChange: onRowsChange,
        onRemove: onRowsRemove,
        error: arrayError?.[key],
        value: row,
        autoFocus: newlyCreatedOptionIdRef.current === row.clientId,
        index,
    }), [
        onRowsChange,
        onRowsRemove,
        arrayError,
    ]);

    return (
        <>
            <NonFieldError error={error} />
            <Container
                className={className}
                sub
                // FIXME: Use translation
                heading="Rows"
                horizontallyCompactContent
                contentClassName={styles.optionsList}
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
                <NonFieldError error={error?.rows} />
                <SortableList
                    name="options"
                    onChange={handleOrderChange}
                    data={value?.rows}
                    keySelector={rowKeySelector}
                    renderer={RowInput}
                    direction="vertical"
                    rendererParams={rowRendererParams}
                    showDragOverlay
                />
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
            className={styles.widgetEdit}
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

export default Matrix1dWidgetForm;
