import React, { useCallback } from 'react';
import {
    IoTrashBinOutline,
    IoRepeatOutline,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import produce from 'immer';
import {
    Button,
    Checkbox,
    QuickActionButton,
    Container,
    SelectInput,
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
    requiredListCondition,
    PartialForm,
    getErrorObject,
    defaultUndefinedType,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import ConjunctionInput from '#components/ConjunctionInput';
import NonFieldError from '#components/NonFieldError';
import SortableList, { Attributes, Listeners } from '#components/SortableList';
import { reorder } from '#utils/common';

import {
    Matrix1dConditional,
    Matrix1dCondition,
    Matrix1dCellsSelectedCondition,
    Matrix1dRowsSelectedCondition,
    Conjunction,
    Matrix1dWidget,
} from '#types/newAnalyticalFramework';

import SimpleMatrix1dConditionInput from './SimpleMatrix1dConditionInput';

import styles from './styles.css';

interface Option {
    key: Matrix1dCondition['operator'],
    label: string,
    invertedLabel: string,
}

const options: Option[] = [
    { key: 'matrix1d-rows-selected', label: 'Is row selected', invertedLabel: 'Is row not selected' },
    { key: 'matrix1d-cells-selected', label: 'Is cell selected', invertedLabel: 'Is cell not selected' },
    { key: 'empty', label: 'Is empty', invertedLabel: 'Is not empty' },
];
function optionKeySelector(value: Option) {
    return value.key;
}
function optionLabelSelector(value: Option) {
    return value.label;
}
function optionInvertedLabelSelector(value: Option) {
    return value.invertedLabel;
}

const CONDITIONS_LIMIT = 10;

type FormType = Matrix1dConditional;
type PartialFormType = PartialForm<
    FormType,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type ConditionType = NonNullable<NonNullable<FormType['conditions'][number]>>;
export type PartialConditionType = PartialForm<
    ConditionType,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

type PartialConditionTypeNew = PartialForm<
    Matrix1dCellsSelectedCondition | Matrix1dRowsSelectedCondition,
    'operator' | 'conjunctionOperator' | 'key' | 'order'
>;

type ConditionSchema = ObjectSchema<PartialConditionType, PartialFormType>;
type ConditionSchemaFields = ReturnType<ConditionSchema['fields']>;
const conditionSchema: ConditionSchema = {
    fields: (val): ConditionSchemaFields => {
        const basicValidation = {
            key: [],
            conjunctionOperator: [],
            operator: [requiredStringCondition],
            order: [],
            invert: [],
        };
        if (!val) {
            return basicValidation;
        }
        if (
            val.operator === 'matrix1d-cells-selected'
            || val.operator === 'matrix1d-rows-selected'
        ) {
            return {
                ...basicValidation,
                value: [requiredListCondition],
                operatorModifier: [requiredStringCondition],
            };
        }
        if (val.operator === 'empty') {
            return basicValidation;
        }
        return basicValidation;
    },
};

type ConditionsSchema = ArraySchema<PartialConditionType, PartialFormType>;
type ConditionsSchemaMember = ReturnType<ConditionsSchema['member']>;
const conditionsSchema: ConditionsSchema = {
    keySelector: (col) => col.key,
    member: (): ConditionsSchemaMember => conditionSchema,
    validation: (conditions) => {
        if ((conditions?.length ?? 0) <= 0) {
            return 'At least one condition is required.';
        }
        return undefined;
    },
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        id: [defaultUndefinedType],
        clientId: [],
        parentClientId: [],
        parentWidgetId: [],
        conditions: conditionsSchema,
    }),
};

const conditionKeySelector = (o: PartialConditionType) => o.key;

const defaultConditionVal = (): PartialConditionType => ({
    key: randomString(),
    order: -1,

    conjunctionOperator: 'AND',
    invert: false,
    operator: 'empty',
});

interface ConditionInputProps {
    className?: string;
    value: PartialConditionType;
    error: Error<ConditionType> | undefined;
    onChange: (value: SetValueArg<PartialConditionType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    conjunctionOperatorHidden?: boolean;
    listeners?: Listeners,
    attributes?: Attributes,
    parentWidget: Matrix1dWidget | undefined;
}

function ConditionInput(props: ConditionInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        listeners,
        attributes,
        conjunctionOperatorHidden,
        parentWidget,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultConditionVal);

    const error = getErrorObject(riskyError);

    const errored = analyzeErrors(error);

    const handleOperatorChange = useCallback(
        (operator: Option['key']) => {
            onChange((val) => {
                if (!val) {
                    // eslint-disable-next-line no-console
                    console.error('Trying to change operator when no value is defined');
                    return {
                        key: randomString(),
                        order: -1,
                        conjunctionOperator: 'AND',
                        invert: false,
                        operator: 'empty',
                    };
                }
                return {
                    key: val.key,
                    conjunctionOperator: val.conjunctionOperator,
                    order: val.order,
                    invert: val.invert,
                    operator,
                };
            }, index);
        },
        [index, onChange],
    );

    return (
        <Container
            className={className}
            // NOTE: newly created elements should be open, else closed
            // FIXME: use strings
            heading={`Condition ${index + 1} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            contentClassName={styles.container}
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
            footerContent={!conjunctionOperatorHidden && (
                <ConjunctionInput
                    name="conjunctionOperator"
                    value={value.conjunctionOperator}
                    onChange={onFieldChange}
                    error={error?.conjunctionOperator}
                />
            )}
            headerActions={(
                <QuickActionButton
                    name={index}
                    onClick={onRemove}
                    // FIXME: use translation
                    title="Remove Condition"
                >
                    <IoTrashBinOutline />
                </QuickActionButton>
            )}
        >
            <NonFieldError error={error} />
            <SelectInput
                name={undefined}
                options={options}
                keySelector={optionKeySelector}
                labelSelector={value.invert ? optionInvertedLabelSelector : optionLabelSelector}
                value={value.operator}
                error={error?.operator}
                onChange={handleOperatorChange}
                nonClearable
                actions={(
                    <Checkbox
                        name="invert"
                        value={value.invert}
                        // error={error?.invert}
                        onChange={onFieldChange}
                        checkmark={IoRepeatOutline}
                    />
                )}
            />
            {(
                value.operator === 'matrix1d-cells-selected'
                || value.operator === 'matrix1d-rows-selected'
            ) && (
                <SimpleMatrix1dConditionInput
                    index={index}
                    value={value}
                    // NOTE: we need to cast here as TS is not smart enough to
                    // identify onChange as valid because of discriminated
                    // unions
                    // eslint-disable-next-line max-len
                    onChange={onChange as (v: SetValueArg<PartialConditionTypeNew>, index: number) => void}
                    error={error}
                    parentWidget={parentWidget}
                    operator={value.operator}
                />
            )}
        </Container>
    );
}

interface Matrix1dConditionalWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    initialValue: PartialFormType;
    className?: string;
    children?: React.ReactNode;
    title: string | undefined;
    parentWidget: Matrix1dWidget | undefined;
}

function Matrix1dConditionalWidgetForm(props: Matrix1dConditionalWidgetFormProps) {
    const {
        onSave,
        onCancel,
        initialValue,
        className,
        children,
        title,
        parentWidget,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        validate,
        setFieldValue,
        setValue,
        setError,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const handleSubmit = useCallback(
        (values: PartialFormType) => {
            onSave(values as FormType);
        },
        [onSave],
    );

    const {
        setValue: onConditionChange,
        removeValue: onConditionRemove,
    } = useFormArray('conditions', setFieldValue);

    const handleAdd = useCallback(
        (conjunction: Conjunction) => {
            setValue((oldValue) => produce(oldValue, (safeOldValue) => {
                if (!safeOldValue.conditions) {
                    // eslint-disable-next-line no-param-reassign
                    safeOldValue.conditions = [];
                }
                if (safeOldValue.conditions.length >= CONDITIONS_LIMIT) {
                    return;
                }
                const lastCondition = safeOldValue.conditions[safeOldValue.conditions.length - 1];
                if (lastCondition) {
                    lastCondition.conjunctionOperator = conjunction;
                }
                safeOldValue.conditions.push({
                    key: randomString(),
                    order: safeOldValue.conditions.length,
                    conjunctionOperator: 'AND',
                    invert: false,
                    operator: 'empty',
                });
            }), true);
        },
        [setValue],
    );

    const handleOrderChange = useCallback((
        newValues: PartialConditionType[],
    ) => {
        setFieldValue(reorder(newValues), 'conditions');
    }, [setFieldValue]);

    const arrayError = getErrorObject(error?.conditions);

    const totalConditions = value?.conditions?.length ?? 0;

    const conditionRendererParams = useCallback((
        key: string,
        condition: PartialConditionType,
        index: number,
    ): ConditionInputProps => ({
        onChange: onConditionChange,
        onRemove: onConditionRemove,
        error: arrayError?.[key],
        value: condition,
        conjunctionOperatorHidden: index + 1 === totalConditions,
        index,
        parentWidget,
    }), [
        onConditionChange,
        onConditionRemove,
        arrayError,
        totalConditions,
        parentWidget,
    ]);

    return (
        <form
            className={_cs(className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                heading={title}
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
                {children}
                <Container
                    heading="Conditions"
                    headingSize="extraSmall"
                    withoutExternalPadding
                >
                    <NonFieldError error={error?.conditions} />
                    <SortableList
                        name="conditions"
                        onChange={handleOrderChange}
                        data={value?.conditions}
                        keySelector={conditionKeySelector}
                        renderer={ConditionInput}
                        direction="vertical"
                        rendererParams={conditionRendererParams}
                        showDragOverlay
                    />
                    {((value?.conditions?.length ?? 0) > 0) && (
                        <ConjunctionInput
                            name="add-condition"
                            value={undefined}
                            onChange={handleAdd}
                            disabled={(value?.conditions?.length ?? 0) >= CONDITIONS_LIMIT}
                        />
                    )}
                </Container>
            </Container>
        </form>
    );
}

export default Matrix1dConditionalWidgetForm;
