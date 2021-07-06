import React, { useCallback, useEffect, useRef } from 'react';
import {
    IoTrash,
    IoAdd,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import {
    Button,
    Container,
    TextInput,
    TextArea,
    QuickActionButton,
    ExpandableContainer,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    ArraySchema,
    arrayCondition,
    requiredStringCondition,
    useForm,
    useFormArray,
    useFormObject,
    createSubmitHandler,
    StateArg,
    Error,
    analyzeErrors,
} from '@togglecorp/toggle-form';
import {
    _cs,
    randomString,
} from '@togglecorp/fujs';

import NonFieldError from '#components/ui/NonFieldError';
import SortableList, { NodeRef, Attributes, Listeners } from '#components/ui/SortableList';

import { Section, PartialForm } from '../../types';
import styles from './styles.scss';

const SECTIONS_LIMIT = 10;

type FormType = {
    sections: Section[];
};
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type SectionType = NonNullable<NonNullable<FormType['sections']>>[number];
export type PartialSectionType = PartialForm<
    SectionType,
    'clientId' | 'type' | 'order'
>;
// type PartialWidgetType = NonNullable<PartialSectionType['widgets']>[number];

type SectionSchema = ObjectSchema<PartialSectionType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        title: [requiredStringCondition],
        tooltip: [],
        widgets: [arrayCondition],
        order: [],
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: col => col.clientId,
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

const defaultVal: PartialSectionType = {
    clientId: 'random',
    order: -1,
};

const sectionKeySelector = (d: PartialSectionType) => d.clientId;

interface SectionInputProps {
    className?: string;
    value: PartialSectionType;
    error: Error<SectionType> | undefined;
    onChange: (value: StateArg<PartialSectionType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    autoFocus: boolean;
    listeners?: Listeners;
    attributes?: Attributes;
    setNodeRef?: NodeRef;
    style?: React.CSSProperties;
}

function SectionInput(props: SectionInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
        autoFocus,
        listeners,
        attributes,
        setNodeRef,
        style,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            if (autoFocus && divRef.current) {
                divRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        },
        [autoFocus],
    );

    const errored = analyzeErrors(error);
    const heading = value.title ?? `Section ${index + 1}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
        >
            <ExpandableContainer
                containerElementProps={{
                    ref: divRef,
                }}
                heading={`${heading} ${errored ? '*' : ''}`}
                expansionTriggerArea="arrow"
                headerActions={(
                    <>
                        <QuickActionButton
                            name={index}
                            onClick={onRemove}
                            // FIXME: use translation
                            title="Remove Title"
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
                className={_cs(
                    className,
                    autoFocus && styles.focus,
                )}
                horizontallyCompactContent
                defaultVisibility={autoFocus}
            >
                <NonFieldError error={error} />
                <TextInput
                    name="title"
                    label="Title"
                    value={value.title}
                    onChange={onFieldChange}
                    error={error?.fields?.title}
                    autoFocus={autoFocus}
                />
                <TextArea
                    // FIXME: use translation
                    label="Tooltip"
                    name="tooltip"
                    rows={4}
                    value={value.tooltip}
                    onChange={onFieldChange}
                    error={error?.fields?.tooltip}
                />
            </ExpandableContainer>
        </div>
    );
}

interface Props {
    initialValue: PartialSectionType[] | undefined;
    onCancel: () => void;
    onSave: (value: Section[]) => void;
    onChange: (value: PartialSectionType[]) => void;
    focusedSection?: string;
    onFocusChange: (value: string) => void;
}

function SectionsEditor(props: Props) {
    const {
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
        error,
        onValueChange,
        validate,
        onErrorSet,
    } = useForm(defaultFormValues, schema);

    useEffect(
        () => {
            onChange(value.sections ?? []);
        },
        [value.sections, onChange],
    );

    const {
        onValueChange: onSectionsChange,
        onValueRemove: onSectionsRemove,
    } = useFormArray('sections', onValueChange);

    const handleAdd = useCallback(
        () => {
            const oldSections = value.sections ?? [];
            // NOTE: Don't let users add more that certain items
            if (oldSections.length >= SECTIONS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const sortedItems = oldSections.map((v, i) => ({ ...v, order: i }));
            const newSection: PartialSectionType = {
                clientId,
                order: sortedItems.length,
            };
            onValueChange(
                [...sortedItems, newSection],
                'sections' as const,
            );
            onFocusChange(clientId);
        },
        [onValueChange, value.sections, onFocusChange],
    );

    const handleOrderChange = useCallback((
        newValues: PartialSectionType[],
    ) => {
        const orderedValues = newValues.map((v, i) => ({ ...v, order: i }));
        onValueChange(orderedValues, 'sections');
    }, [onValueChange]);

    const sectionRendererParams = useCallback((
        key: string,
        section: PartialSectionType,
        index: number,
    ) => ({
        onChange: onSectionsChange,
        onRemove: onSectionsRemove,
        error: error?.fields?.sections?.members?.[key],
        value: section,
        autoFocus: focusedSection === section.clientId,
        index,
    }), [
        onSectionsChange,
        focusedSection,
        onSectionsRemove,
        error?.fields?.sections?.members,
    ]);

    const handleSubmit = useCallback(
        (values: PartialFormType) => {
            console.log(values);
            onSave((values as FormType).sections);
        },
        [onSave],
    );

    return (
        <form
            className={styles.form}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
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
                sub
            >
                <NonFieldError error={error} />
                <Container
                    sub
                    // FIXME: Use translation
                    heading="Sections"
                    horizontallyCompactContent
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
                        <NonFieldError error={error?.fields?.sections} />
                        <SortableList
                            name="analyticalStatements"
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
