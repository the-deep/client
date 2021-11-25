import React, { useCallback, useEffect } from 'react';
import {
    IoTrashBinOutline,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
    TextInput,
    TextArea,
    QuickActionButton,
    ControlledExpandableContainer,
    Container,
    Tabs,
    Tab,
    TabList,
    TabPanel,
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
import { reorder } from '#utils/common';

import { Matrix2dWidget } from '#types/newAnalyticalFramework';
import styles from './styles.css';

const ROWS_LIMIT = 20;
const SUB_ROWS_LIMIT = 30;
const COLUMNS_LIMIT = 20;
const SUB_COLUMNS_LIMIT = 30;

type FormType = Matrix2dWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type DataType = NonNullable<NonNullable<FormType['properties']>>;
export type PartialDataType = PartialForm<DataType, 'key' | 'widgetId' | 'order'>;

type ColumnType = DataType['columns'][number];
export type PartialColumnType = PartialForm<
    ColumnType,
    'key' | 'widgetId' | 'order'
>;

const columnKeySelector = (d: PartialColumnType) => d.key;

type SubColumnType = ColumnType['subColumns'][number];
export type PartialSubColumnType = PartialForm<
    SubColumnType,
    'key' | 'widgetId' | 'order'
>;

const subColumnKeySelector = (d: PartialSubColumnType) => d.key;

type SubColumnSchema = ObjectSchema<PartialSubColumnType, PartialFormType>;
type SubColumnSchemaFields = ReturnType<SubColumnSchema['fields']>;
const subColumnSchema: SubColumnSchema = {
    fields: (): SubColumnSchemaFields => ({
        key: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type SubColumnsSchema = ArraySchema<PartialSubColumnType, PartialFormType>;
type SubColumnsSchemaMember = ReturnType<SubColumnsSchema['member']>;
const subColumnsSchema: SubColumnsSchema = {
    keySelector: (col) => col.key,
    member: (): SubColumnsSchemaMember => subColumnSchema,
};

type ColumnSchema = ObjectSchema<PartialColumnType, PartialFormType>;
type ColumnSchemaFields = ReturnType<ColumnSchema['fields']>;
const columnSchema: ColumnSchema = {
    fields: (): ColumnSchemaFields => ({
        key: [],
        label: [requiredStringCondition],
        tooltip: [],
        subColumns: subColumnsSchema,
        order: [],
    }),
};

type ColumnsSchema = ArraySchema<PartialColumnType, PartialFormType>;
type ColumnsSchemaMember = ReturnType<ColumnsSchema['member']>;
const columnsSchema: ColumnsSchema = {
    keySelector: (col) => col.key,
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
    'key' | 'widgetId' | 'order'
>;

type SubRowType = RowType['subRows'][number];
export type PartialSubRowType = PartialForm<
    SubRowType,
    'key' | 'widgetId' | 'order'
>;

const rowKeySelector = (d: PartialRowType) => d.key;
const subRowKeySelector = (d: PartialSubRowType) => d.key;

type SubRowSchema = ObjectSchema<PartialSubRowType, PartialFormType>;
type SubRowSchemaFields = ReturnType<SubRowSchema['fields']>;
const subRowSchema: SubRowSchema = {
    fields: (): SubRowSchemaFields => ({
        key: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
    }),
};

type SubRowsSchema = ArraySchema<PartialSubRowType, PartialFormType>;
type SubRowsSchemaMember = ReturnType<SubRowsSchema['member']>;
const subRowsSchema: SubRowsSchema = {
    keySelector: (col) => col.key,
    member: (): SubRowsSchemaMember => subRowSchema,
    validation: (subRows) => {
        if ((subRows?.length ?? 0) <= 0) {
            return 'At least one sub row is required.';
        }
        return undefined;
    },
};

type RowSchema = ObjectSchema<PartialRowType, PartialFormType>;
type RowSchemaFields = ReturnType<RowSchema['fields']>;
const rowSchema: RowSchema = {
    fields: (): RowSchemaFields => ({
        key: [],
        label: [requiredStringCondition],
        tooltip: [],
        color: [],
        order: [],
        subRows: subRowsSchema,
    }),
};

type RowsSchema = ArraySchema<PartialRowType, PartialFormType>;
type RowsSchemaMember = ReturnType<RowsSchema['member']>;
const rowsSchema: RowsSchema = {
    keySelector: (col) => col.key,
    member: (): RowsSchemaMember => rowSchema,
    validation: (rows) => {
        if ((rows?.length ?? 0) <= 0) {
            return 'At least one row is required.';
        }
        return undefined;
    },
};

type DataSchema = ObjectSchema<PartialDataType, PartialFormType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        rows: rowsSchema,
        columns: columnsSchema,
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

const defaultSubRowVal: PartialSubRowType = {
    key: 'random',
    order: -1,
};
interface SubRowInputProps {
    className?: string;
    value: PartialSubRowType;
    error: Error<SubRowType> | undefined;
    onChange: (value: SetValueArg<PartialSubRowType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    autoFocus?: boolean;
    expanded: boolean;
    onExpansionChange: (isExpanded: boolean, subRowId: string) => void;
}
function SubRowInput(props: SubRowInputProps) {
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
        expanded,
        onExpansionChange,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultSubRowVal);

    const error = getErrorObject(riskyError);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Sub Row ${index + 1}`;

    return (
        <ControlledExpandableContainer
            autoFocus={autoFocus}
            className={className}
            contentClassName={styles.containerContent}
            expansionTriggerArea="arrow"
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            name={value.key}
            expanded={expanded}
            onExpansionChange={onExpansionChange}
            withoutBorder
            withoutExternalPadding
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Sub Row"
                    >
                        <IoTrashBinOutline />
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
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
        </ControlledExpandableContainer>
    );
}

const defaultRowVal: PartialRowType = {
    key: 'random',
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
    autoFocus?: boolean;
    expanded: boolean;
    onExpansionChange: (expanded: boolean, key: string) => void;
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
        autoFocus,
        expanded,
        onExpansionChange,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultRowVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.subRows);

    const {
        setValue: onSubRowsChange,
        removeValue: onSubRowsRemove,
    } = useFormArray('subRows', onFieldChange);

    const [expandedSubRowId, setExpandedSubRowId] = React.useState<string | undefined>();

    const handleAdd = useCallback(
        () => {
            const oldSubRows = value.subRows ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSubRows.length >= SUB_ROWS_LIMIT) {
                return;
            }

            const key = randomString();
            newlyCreatedOptionIdRef.current = key;
            const newSubRow: PartialSubRowType = {
                key,
                order: oldSubRows.length,
            };
            onFieldChange(
                [...reorder(oldSubRows), newSubRow],
                'subRows' as const,
            );
            setExpandedSubRowId(key);
        },
        [onFieldChange, value.subRows],
    );

    const handleSubRowsOrderChange = useCallback((newSubRows: PartialSubRowType[]) => {
        onFieldChange(reorder(newSubRows), 'subRows');
    }, [onFieldChange]);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Row ${index + 1}`;

    const handleSubRowExpansionChange = useCallback((subRowExpanded: boolean, subRowId: string) => {
        setExpandedSubRowId(subRowExpanded ? subRowId : undefined);
    }, []);

    const subRowRendererParams = useCallback(
        (
            key: string,
            data: PartialSubRowType,
            subRowIndex: number,
        ): SubRowInputProps => ({
            index: subRowIndex,
            value: data,
            onChange: onSubRowsChange,
            onRemove: onSubRowsRemove,
            error: arrayError?.[key],
            autoFocus: newlyCreatedOptionIdRef.current === data.key,
            expanded: expandedSubRowId === data.key,
            onExpansionChange: handleSubRowExpansionChange,
        }),
        [
            onSubRowsChange,
            onSubRowsRemove,
            arrayError,
            expandedSubRowId,
            handleSubRowExpansionChange,
        ],
    );

    return (
        <ControlledExpandableContainer
            autoFocus={autoFocus}
            className={className}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            contentClassName={styles.containerContent}
            expansionTriggerArea="arrow"
            name={value.key}
            expanded={expanded}
            onExpansionChange={onExpansionChange}
            withoutBorder
            withoutExternalPadding
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
                    title="Remove Row"
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
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
            <Container
                heading="Sub Rows"
                headingSize="extraSmall"
                className={styles.container}
                contentClassName={styles.containerContent}
                withoutExternalPadding
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
                <NonFieldError error={error?.subRows} />
                <SortableList
                    className={styles.sortableList}
                    name="subRows"
                    onChange={handleSubRowsOrderChange}
                    data={value.subRows}
                    keySelector={subRowKeySelector}
                    renderer={SubRowInput}
                    rendererParams={subRowRendererParams}
                    direction="vertical"
                />
            </Container>
        </ControlledExpandableContainer>
    );
}

const defaultSubColumnVal: PartialSubColumnType = {
    key: 'random',
    order: -1,
};
interface SubColumnInputProps {
    className?: string;
    value: PartialSubColumnType;
    error: Error<SubColumnType> | undefined;
    onChange: (value: SetValueArg<PartialSubColumnType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    autoFocus?: boolean;
    expanded: boolean;
    onExpansionChange: (isExpanded: boolean, rowId: string) => void;
}
function SubColumnInput(props: SubColumnInputProps) {
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
        expanded,
        onExpansionChange,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultSubColumnVal);

    const error = getErrorObject(riskyError);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Sub Column ${index + 1}`;

    return (
        <ControlledExpandableContainer
            autoFocus={autoFocus}
            className={className}
            contentClassName={styles.containerContent}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            expansionTriggerArea="arrow"
            name={value.key}
            expanded={expanded}
            onExpansionChange={onExpansionChange}
            withoutBorder
            withoutExternalPadding
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Sub Column"
                    >
                        <IoTrashBinOutline />
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
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
        </ControlledExpandableContainer>
    );
}

const defaultColumnVal: PartialColumnType = {
    key: 'random',
    order: -1,
};
interface ColumnInputProps {
    className?: string;
    value: PartialColumnType;
    error: Error<ColumnType> | undefined;
    onChange: (value: SetValueArg<PartialColumnType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    autoFocus?: boolean;
    expanded: boolean;
    onExpansionChange: (isExpanded: boolean, columnId: string) => void;
}
function ColumnInput(props: ColumnInputProps) {
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
        expanded,
        onExpansionChange,
    } = props;

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.subColumns);

    const onFieldChange = useFormObject(index, onChange, defaultColumnVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const {
        setValue: onSubColumnsChange,
        removeValue: onSubColumnsRemove,
    } = useFormArray('subColumns', onFieldChange);

    const [expandedSubColumnId, setExpandedSubColumnId] = React.useState<string | undefined>();

    const handleAdd = useCallback(
        () => {
            const oldSubColumns = value.subColumns ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSubColumns.length >= SUB_COLUMNS_LIMIT) {
                return;
            }

            const key = randomString();
            newlyCreatedOptionIdRef.current = key;
            const newSubColumn: PartialSubColumnType = {
                key,
                order: oldSubColumns.length,
            };
            onFieldChange(
                [...reorder(oldSubColumns), newSubColumn],
                'subColumns' as const,
            );
            setExpandedSubColumnId(key);
        },
        [onFieldChange, value.subColumns],
    );

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Column ${index + 1}`;

    const handleSubColumnOrderChange = useCallback((newSubColumns: PartialSubColumnType[]) => {
        onFieldChange(reorder(newSubColumns), 'subColumns');
    }, [onFieldChange]);

    const handleSubColumnExpansionChange = React.useCallback(
        (subColumnExpanded: boolean, subColumnId: string) => {
            setExpandedSubColumnId(subColumnExpanded ? subColumnId : undefined);
        },
        [],
    );

    const subColumnRendererParams = useCallback(
        (
            key: string,
            data: PartialSubColumnType,
            subColumnIndex: number,
        ): SubColumnInputProps => ({
            index: subColumnIndex,
            value: data,
            onChange: onSubColumnsChange,
            onRemove: onSubColumnsRemove,
            error: arrayError?.[key],
            autoFocus: newlyCreatedOptionIdRef.current === data.key,
            expanded: expandedSubColumnId === data.key,
            onExpansionChange: handleSubColumnExpansionChange,
        }),
        [
            onSubColumnsChange,
            onSubColumnsRemove,
            arrayError,
            expandedSubColumnId,
            handleSubColumnExpansionChange,
        ],
    );

    return (
        <ControlledExpandableContainer
            autoFocus={autoFocus}
            className={className}
            contentClassName={styles.containerContent}
            // FIXME: use strings
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            expansionTriggerArea="arrow"
            withoutBorder
            withoutExternalPadding
            name={value.key}
            expanded={expanded}
            onExpansionChange={onExpansionChange}
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Column"
                    >
                        <IoTrashBinOutline />
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
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
            <Container
                className={styles.container}
                heading="Sub Columns"
                headingSize="extraSmall"
                contentClassName={styles.containerContent}
                withoutExternalPadding
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
                <NonFieldError error={error?.subColumns} />
                <SortableList
                    className={styles.sortableList}
                    name="subColumns"
                    onChange={handleSubColumnOrderChange}
                    data={value.subColumns}
                    keySelector={subColumnKeySelector}
                    renderer={SubColumnInput}
                    rendererParams={subColumnRendererParams}
                    direction="vertical"
                />
            </Container>
        </ControlledExpandableContainer>
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
    const rowError = getErrorObject(error?.rows);
    const columnError = getErrorObject(error?.columns);

    const onFieldChange = useFormObject(name, onChange, defaultVal);
    const newlyCreatedOptionIdRef = React.useRef<string | undefined>();

    const [expandedRowId, setExpandedRowId] = React.useState<string | undefined>();
    const [expandedColumnId, setExpandedColumnId] = React.useState<string | undefined>();

    const {
        setValue: onRowsChange,
        removeValue: onRowsRemove,
    } = useFormArray('rows', onFieldChange);

    const handleRowAdd = useCallback(
        () => {
            const oldRows = value?.rows ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldRows.length >= ROWS_LIMIT) {
                return;
            }

            const key = randomString();
            newlyCreatedOptionIdRef.current = key;
            const newRow: PartialRowType = {
                key,
                order: oldRows.length,
            };
            onFieldChange(
                [...reorder(oldRows), newRow],
                'rows' as const,
            );
            setExpandedRowId(key);
        },
        [onFieldChange, value?.rows],
    );

    const {
        setValue: onColumnsChange,
        removeValue: onColumnsRemove,
    } = useFormArray('columns', onFieldChange);

    const handleRowExpansionChange = useCallback((rowExpanded: boolean, rowId: string) => {
        setExpandedRowId(rowExpanded ? rowId : undefined);
    }, []);

    const handleColumnExpansionChange = useCallback((columnExpanded: boolean, columnId: string) => {
        setExpandedColumnId(columnExpanded ? columnId : undefined);
    }, []);

    const columnRendererParams = useCallback(
        (
            key: string,
            data: PartialColumnType,
            index: number,
        ): ColumnInputProps => ({
            index,
            value: data,
            onChange: onColumnsChange,
            onRemove: onColumnsRemove,
            error: columnError?.[key],
            autoFocus: newlyCreatedOptionIdRef.current === data.key,
            expanded: expandedColumnId === data.key,
            onExpansionChange: handleColumnExpansionChange,
        }),
        [
            onColumnsChange,
            onColumnsRemove,
            columnError,
            expandedColumnId,
            handleColumnExpansionChange,
        ],
    );

    const rowRendererParams = useCallback(
        (
            key: string,
            data: PartialRowType,
            index: number,
        ): RowInputProps => ({
            index,
            value: data,
            onChange: onRowsChange,
            onRemove: onRowsRemove,
            error: rowError?.[key],
            autoFocus: newlyCreatedOptionIdRef.current === data.key,
            expanded: expandedRowId === data.key,
            onExpansionChange: handleRowExpansionChange,
        }),
        [
            onRowsChange,
            onRowsRemove,
            rowError,
            expandedRowId,
            handleRowExpansionChange,
        ],
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

            const key = randomString();
            newlyCreatedOptionIdRef.current = key;
            const newColumn: PartialColumnType = {
                key,
                order: oldColumns.length,
            };
            onFieldChange(
                [...reorder(oldColumns), newColumn],
                'columns' as const,
            );
            setExpandedColumnId(key);
        },
        [onFieldChange, value?.columns],
    );

    const [activeTab, setActiveTab] = React.useState<'rows' | 'columns' | undefined>('rows');

    return (
        <Tabs
            variant="primary"
            value={activeTab}
            onChange={setActiveTab}
        >
            <NonFieldError error={error} />
            <TabList className={styles.tabList}>
                <Tab
                    name="rows"
                    className={_cs(
                        styles.tab,
                        analyzeErrors(rowError) && styles.errored,
                    )}
                >
                    Rows
                </Tab>
                <Tab
                    name="columns"
                    className={_cs(
                        styles.tab,
                        analyzeErrors(columnError) && styles.errored,
                    )}
                >
                    Columns
                </Tab>
            </TabList>
            <TabPanel name="rows">
                <Container
                    className={_cs(styles.container, className)}
                    contentClassName={styles.containerContent}
                    heading="Rows"
                    headingSize="small"
                    withoutExternalPadding
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
                    <NonFieldError error={error?.rows} />
                    <SortableList
                        className={styles.sortableList}
                        name="rows"
                        onChange={handleRowsOrderChange}
                        data={value?.rows}
                        keySelector={rowKeySelector}
                        renderer={RowInput}
                        rendererParams={rowRendererParams}
                        direction="vertical"
                    />
                </Container>
            </TabPanel>
            <TabPanel name="columns">
                <Container
                    className={_cs(styles.container, className)}
                    headingSize="small"
                    contentClassName={styles.containerContent}
                    heading="Columns"
                    withoutExternalPadding
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
                    <NonFieldError error={error?.columns} />
                    <SortableList
                        className={styles.sortableList}
                        name="columns"
                        onChange={handleColumnsOrderChange}
                        data={value?.columns}
                        keySelector={columnKeySelector}
                        renderer={ColumnInput}
                        rendererParams={columnRendererParams}
                        direction="vertical"
                    />
                </Container>
            </TabPanel>
        </Tabs>
    );
}

interface Matrix2dWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}

function Matrix2dWidgetForm(props: Matrix2dWidgetFormProps) {
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
            className={_cs(styles.matrix2DWidgetForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.container}
                heading={value.title ?? 'Unnamed'}
                contentClassName={styles.editorContent}
                withoutExternalPadding
                ellipsizeHeading
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
                    // FIXME: use translation
                    label="Title"
                    name="title"
                    autoFocus
                    value={value.title}
                    onChange={setFieldValue}
                    error={error?.title}
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

export default Matrix2dWidgetForm;
