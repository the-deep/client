import React, { useCallback, useEffect, useState } from 'react';
import {
    IoTrashBinOutline,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
    Container,
    TextInput,
    TextArea,
    QuickActionButton,
    QuickActionConfirmButton,
    ControlledExpandableContainer,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    ArraySchema,
    defaultEmptyArrayType,
    requiredStringCondition,
    useForm,
    useFormArray,
    useFormObject,
    createSubmitHandler,
    SetValueArg,
    Error,
    analyzeErrors,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/NonFieldError';
import SortableList, { Attributes, Listeners } from '#components/SortableList';
import { reorder } from '#utils/common';

import { Section } from '../../types';
import styles from './styles.css';

const SECTIONS_LIMIT = 10;

type FormType = {
    sections: Section[];
};
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type SectionType = NonNullable<NonNullable<FormType['sections']>>[number];
export type PartialSectionType = PartialForm<
    SectionType,
    'clientId' | 'key' | 'widgetId' | 'order' | 'conditional'
>;
// type PartialWidgetType = NonNullable<PartialSectionType['widgets']>[number];

type SectionSchema = ObjectSchema<PartialSectionType, PartialFormType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        title: [requiredStringCondition],
        tooltip: [],
        widgets: [defaultEmptyArrayType],
        order: [],
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType, PartialFormType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: (col) => col.clientId,
    member: (): SectionsSchemaMember => sectionSchema,
    validation: (sections) => {
        if ((sections?.length ?? 0) <= 0) {
            // FIXME: use strings
            return 'At least one section is required.';
        }
        return undefined;
    },
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        sections: sectionsSchema,
    }),
};

const defaultVal = (): PartialSectionType => ({
    clientId: `auto-${randomString()}`,
    order: -1,
});

const sectionKeySelector = (d: PartialSectionType) => d.clientId;

interface SectionInputProps {
    className?: string;
    value: PartialSectionType;
    error: Error<SectionType> | undefined;
    onChange: (value: SetValueArg<PartialSectionType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    autoFocus: boolean;
    listeners?: Listeners;
    attributes?: Attributes;
    onExpansionChange: (sectionExpanded: boolean, sectionId: string) => void;
    expanded?: boolean;
}

function SectionInput(props: SectionInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        index,
        autoFocus,
        listeners,
        attributes,
        onExpansionChange,
        expanded,
    } = props;

    const error = getErrorObject(riskyError);

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    const errored = analyzeErrors(error);
    const heading = value.title ?? `Section ${index + 1}`;

    const handleSectionRemoveConfirmClick = useCallback(() => {
        onRemove(index);
    }, [onRemove, index]);

    return (
        <ControlledExpandableContainer
            name={value.clientId}
            autoFocus={autoFocus}
            heading={`${heading} ${errored ? '*' : ''}`}
            headingSize="extraSmall"
            expansionTriggerArea="arrow"
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
                <QuickActionConfirmButton
                    name={index}
                    onConfirm={handleSectionRemoveConfirmClick}
                    message="Are you sure you want to remove this section? Removing the section will remove all widgets within the section."
                    // FIXME: use translation
                    title="Remove Title"
                >
                    <IoTrashBinOutline />
                </QuickActionConfirmButton>
            )}
            className={_cs(
                className,
                autoFocus && styles.focus,
                styles.sectionExpandable,
            )}
            headerClassName={styles.sectionHeader}
            headingClassName={styles.heading}
            onExpansionChange={onExpansionChange}
            expanded={expanded}
            withoutBorder
        >
            <NonFieldError error={error} />
            <TextInput
                name="title"
                className={styles.textInput}
                label="Title"
                value={value.title}
                onChange={onFieldChange}
                error={error?.title}
                autoFocus={autoFocus}
            />
            <TextArea
                // FIXME: use translation
                label="Tooltip"
                className={styles.textInput}
                name="tooltip"
                rows={4}
                value={value.tooltip}
                onChange={onFieldChange}
                error={error?.tooltip}
            />
        </ControlledExpandableContainer>
    );
}

interface Props {
    initialValue: PartialSectionType[] | undefined;
    onCancel: () => void;
    onSave: (value: Section[]) => void;
    onChange: (value: PartialSectionType[]) => void;
    focusedSection?: string;
    onFocusChange: (value: string) => void;
    className?: string;
}

function SectionsEditor(props: Props) {
    const {
        className,
        initialValue,
        onChange,
        onSave,
        onCancel,
        focusedSection,
        onFocusChange,
    } = props;

    const defaultFormValues: PartialFormType = {
        sections: initialValue,
    };

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
    } = useForm(schema, defaultFormValues);

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.sections);

    useEffect(
        () => {
            onChange(value.sections ?? []);
        },
        [value.sections, onChange],
    );

    const {
        setValue: onSectionsChange,
        removeValue: onSectionsRemove,
    } = useFormArray('sections', setFieldValue);

    const [expandedSectionId, setExpandedSectionId] = useState<string | undefined>(
        focusedSection ?? undefined,
    );

    const handleExpansionChange = useCallback((sectionExpanded: boolean, sectionId: string) => {
        setExpandedSectionId(sectionExpanded ? sectionId : undefined);
    }, []);

    const handleAdd = useCallback(
        () => {
            const oldSections = value.sections ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSections.length >= SECTIONS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const sortedItems = reorder(oldSections);
            const newSection: PartialSectionType = {
                clientId,
                order: sortedItems.length + 1,
            };
            setFieldValue(
                [...sortedItems, newSection],
                'sections' as const,
            );
            onFocusChange(clientId);
            setExpandedSectionId(clientId);
        },
        [setFieldValue, value.sections, onFocusChange],
    );

    const handleOrderChange = useCallback((
        newValues: PartialSectionType[],
    ) => {
        const orderedValues = reorder(newValues);
        setFieldValue(orderedValues, 'sections');
    }, [setFieldValue]);

    const sectionRendererParams = useCallback((
        key: string,
        section: PartialSectionType,
        index: number,
    ) => ({
        onChange: onSectionsChange,
        onRemove: onSectionsRemove,
        error: arrayError?.[key],
        value: section,
        autoFocus: focusedSection === section.clientId,
        index,
        onExpansionChange: handleExpansionChange,
        expanded: expandedSectionId === section.clientId,
    }), [
        onSectionsChange,
        focusedSection,
        onSectionsRemove,
        arrayError,
        expandedSectionId,
        handleExpansionChange,
    ]);

    const handleSubmit = useCallback(
        (values: PartialFormType) => {
            onSave((values as FormType).sections);
        },
        [onSave],
    );

    return (
        <form
            className={_cs(styles.form, className)}
            onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
        >
            <Container
                className={styles.mainContainer}
                heading="Sections"
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
                contentClassName={styles.content}
            >
                <NonFieldError error={error} />
                <Container
                    className={styles.sectionContainer}
                    headerActions={(value.sections?.length ?? 0) < SECTIONS_LIMIT && (
                        <QuickActionButton
                            name={undefined}
                            onClick={handleAdd}
                            // FIXME: use strings
                            title="Add section"
                        >
                            <IoAdd />
                        </QuickActionButton>
                    )}
                >
                    <>
                        <NonFieldError error={error?.sections} />
                        <SortableList
                            name="sections"
                            className={styles.list}
                            onChange={handleOrderChange}
                            data={value.sections}
                            keySelector={sectionKeySelector}
                            renderer={SectionInput}
                            rendererClassName={styles.sectionInput}
                            direction="vertical"
                            rendererParams={sectionRendererParams}
                            showDragOverlay
                        />
                    </>
                </Container>
            </Container>
        </form>
    );
}
export default SectionsEditor;
