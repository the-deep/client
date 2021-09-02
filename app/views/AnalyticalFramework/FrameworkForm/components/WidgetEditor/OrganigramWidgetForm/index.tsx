import React, { useCallback, useEffect, useState } from 'react';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';
import {
    IoAdd,
    IoTrash,
} from 'react-icons/io5';
import {
    Button,
    TextInput,
    TextArea,
    QuickActionButton,
    Container,
    ControlledExpandableContainer,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    useFormObject,
    createSubmitHandler,
    SetValueArg,
    Error,
    analyzeErrors,
    requiredStringCondition,
    useFormArray,
    PartialForm,
    getErrorObject,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import { GrDrag } from 'react-icons/gr';
import NonFieldError from '#components/NonFieldError';
import SortableList, { Attributes, Listeners } from '#components/SortableList';
import { reorder } from '#utils/common';
import { OrganigramWidget } from '#types/newAnalyticalFramework';

import styles from './styles.css';

const OPTIONS_LIMIT = 100;

type FormType = OrganigramWidget;
type PartialFormType = PartialForm<
FormType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;
type DataType = NonNullable<NonNullable<FormType['properties']>>;
export type PartialDataType = PartialForm<DataType, 'clientId' | 'key' | 'widgetId' | 'order'>;

type RootType = DataType['options'];
export type PartialRootType = PartialForm<
    RootType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type RootSchema = ObjectSchema<PartialRootType>;
type RootSchemaFields = ReturnType<RootSchema['fields']>;
const rootSchema: RootSchema = {
    fields: (): RootSchemaFields => ({
        clientId: [],
        label: [requiredStringCondition],
        tooltip: [],
        order: [],
        children: [],
    }),
};
type NodeType = RootType['children'][number];
export type PartialNodeType = PartialForm<
    NodeType,
    'clientId' | 'key' | 'widgetId' | 'order'
>;

type DataSchema = ObjectSchema<PartialDataType>;
type DataSchemaFields = ReturnType<DataSchema['fields']>;
const dataSchema: DataSchema = {
    fields: (): DataSchemaFields => ({
        options: rootSchema,
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
const defaultNodeVal: PartialNodeType = {
    clientId: 'random',
    order: -1,
};

const optionKeySelector = (o: PartialRootType) => o.clientId;

interface NodeInputProps {
    className?: string;
    value: PartialNodeType;
    error: Error<NodeType> | undefined;
    onChange: (value: SetValueArg<PartialNodeType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    listeners?: Listeners;
    attributes?: Attributes;
    autoFocus?: boolean;
}

function NodeInput(props: NodeInputProps) {
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

    const [expanded, setExpanded] = useState<boolean>(autoFocus || true);
    const onFieldChange = useFormObject(index, onChange, defaultNodeVal);
    const newlyCreatedNodeIdRef = React.useRef<string | undefined>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.children);

    const errored = analyzeErrors(error);
    const heading = value.label ?? `Option ${index + 1}`;
    const {
        setValue: onSiblingChange,
        removeValue: onSiblingRemove,
    } = useFormArray('children', onFieldChange);

    const handleAdd = useCallback(
        () => {
            setExpanded(true);
            const oldNodes = value?.children ?? [];
            const clientId = randomString();
            newlyCreatedNodeIdRef.current = clientId;
            const newNode: PartialNodeType = {
                clientId,
                order: oldNodes.length,
            };
            onFieldChange(
                [...reorder(oldNodes), newNode],
                'children' as const,
            );
        },
        [onFieldChange, value?.children],
    );

    const handleOrderChange = useCallback((
        newValues: PartialNodeType[],
    ) => {
        onFieldChange(reorder(newValues), 'children');
    }, [onFieldChange]);

    const optionRendererParams = useCallback((
        key: string,
        option: PartialNodeType,
        optionIndex: number,
    ): NodeInputProps => ({
        onChange: onSiblingChange,
        onRemove: onSiblingRemove,
        error: arrayError?.[key],
        value: option,
        autoFocus: newlyCreatedNodeIdRef.current === option.clientId,
        index: optionIndex,
    }), [
        onSiblingChange,
        onSiblingRemove,
        arrayError,
    ]);

    return (
        <ControlledExpandableContainer
            name={value.label}
            className={className}
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            expanded={expanded}
            onExpansionChange={setExpanded}
            autoFocus={autoFocus}
            expansionTriggerArea="arrow"
            headerActions={(value?.children?.length ?? 0) < OPTIONS_LIMIT && (
                <>
                    <QuickActionButton
                        name={undefined}
                        onClick={handleAdd}
                        // FIXME: use strings
                        title="Add cell"
                    >
                        <IoAdd />
                    </QuickActionButton>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use strings
                        title="Remove cell"
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
                value={value?.label}
                onChange={onFieldChange}
                error={error?.label}
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value?.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
            <SortableList
                name="children"
                onChange={handleOrderChange}
                data={value?.children}
                keySelector={optionKeySelector}
                renderer={NodeInput}
                direction="vertical"
                rendererParams={optionRendererParams}
            />
        </ControlledExpandableContainer>
    );
}
const defaultRootVal: PartialRootType = {
    clientId: 'random',
    order: -1,
};

interface RootInputProps<K extends string> {
    className?: string;
    name: K;
    value: PartialRootType | undefined;
    error: Error<RootType> | undefined;
    onChange: (value: SetValueArg<PartialRootType | undefined>, name: K) => void;
}

function RootInput<K extends string>(props: RootInputProps<K>) {
    const {
        className,
        name,
        value,
        error: riskyError,
        onChange,
    } = props;

    const onFieldChange = useFormObject(name, onChange, defaultRootVal);
    const newlyCreatedNodeIdRef = React.useRef<string | undefined>();
    const error = getErrorObject(riskyError);
    const heading = value?.label ?? 'Unnamed';
    const errored = analyzeErrors(error);
    const arrayError = getErrorObject(error?.children);
    const {
        setValue: onSiblingChange,
        removeValue: onSiblingRemove,
    } = useFormArray('children', onFieldChange);

    const handleOrderChange = useCallback((
        newValues: PartialNodeType[],
    ) => {
        onFieldChange(newValues, 'children');
    }, [onFieldChange]);

    const handleAdd = useCallback(
        () => {
            const oldNodes = value?.children ?? [];

            const clientId = randomString();
            newlyCreatedNodeIdRef.current = clientId;
            const newNode: PartialNodeType = {
                clientId,
                order: oldNodes.length,
            };
            onFieldChange(
                [...oldNodes, newNode],
                'children' as const,
            );
        },
        [onFieldChange, value?.children],
    );

    const optionRendererParams = useCallback((
        key: string,
        option: PartialNodeType,
        optionIndex: number,
    ): NodeInputProps => ({
        onChange: onSiblingChange,
        onRemove: onSiblingRemove,
        error: arrayError?.[key],
        value: option,
        autoFocus: newlyCreatedNodeIdRef.current === option.clientId,
        index: optionIndex,
    }), [
        onSiblingChange,
        onSiblingRemove,
        arrayError,
    ]);

    return (
        <Container
            className={className}
            headingSize="extraSmall"
            heading={`${heading} ${errored ? '*' : ''}`}
            headerActions={(value?.children?.length ?? 0) < OPTIONS_LIMIT && (
                <QuickActionButton
                    name={undefined}
                    onClick={handleAdd}
                    // FIXME: use strings
                    title="Add cell"
                >
                    <IoAdd />
                </QuickActionButton>
            )}
        >
            <NonFieldError error={error} />
            <TextInput
                // FIXME: use translation
                label="Label"
                name="label"
                value={value?.label}
                onChange={onFieldChange}
                error={error?.label}
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                name="tooltip"
                rows={2}
                value={value?.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
            <SortableList
                name="children"
                onChange={handleOrderChange}
                data={value?.children}
                keySelector={optionKeySelector}
                renderer={NodeInput}
                direction="vertical"
                rendererParams={optionRendererParams}
            />
        </Container>
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
    const error = getErrorObject(riskyError);

    return (
        <>
            <NonFieldError
                error={error}
            />
            <Container
                className={className}
                headingSize="small"
                heading="Organigram Structure"
            >
                <NonFieldError error={error?.options} />
                <RootInput
                    name="options"
                    onChange={onFieldChange}
                    value={value?.options}
                    error={error?.options}
                />
            </Container>
        </>
    );
}

interface OrganigramWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
    className?: string;
}
function OrganigramWidgetForm(props: OrganigramWidgetFormProps) {
    const {
        className,
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
            className={_cs(styles.organigramWidgetForm, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                heading={value.title ?? 'Unnamed'}
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
                <NonFieldError
                    error={error}
                />
                <TextInput
                    autoFocus
                    label="Title"
                    name="title"
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

export default OrganigramWidgetForm;
