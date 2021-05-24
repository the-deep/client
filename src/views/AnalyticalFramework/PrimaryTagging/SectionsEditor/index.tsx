import React, { useCallback, useEffect } from 'react';
import {
    IoClose,
} from 'react-icons/io5';
import {
    Button,
    TextInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    PartialForm,
    ArraySchema,
    arrayCondition,
    requiredStringCondition,
    useForm,
    useFormArray,
    useFormObject,
    createSubmitHandler,
    StateArg,
    Error,
} from '@togglecorp/toggle-form';
import { randomString } from '@togglecorp/fujs';

import { Section } from '../types';

const SECTIONS_LIMIT = 10;

type FormType = {
    sections: Section[];
};
type PartialFormType = PartialForm<FormType, { clientId: string }>;

type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

type SectionType = NonNullable<NonNullable<FormType['sections']>>[number];
export type PartialSectionType = PartialForm<
    SectionType, { clientId: string }
>;

type SectionSchema = ObjectSchema<PartialSectionType>;
type SectionSchemaFields = ReturnType<SectionSchema['fields']>;
const sectionSchema: SectionSchema = {
    fields: (): SectionSchemaFields => ({
        clientId: [],
        title: [requiredStringCondition],
        widgets: [arrayCondition],
    }),
};

type SectionsSchema = ArraySchema<PartialSectionType>;
type SectionsSchemaMember = ReturnType<SectionsSchema['member']>;
const sectionsSchema: SectionsSchema = {
    keySelector: col => col.clientId,
    member: (): SectionsSchemaMember => sectionSchema,
};

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        sections: sectionsSchema,
    }),
};

const defaultVal: PartialSectionType = {
    clientId: 'random',
};
interface SectionInputProps {
    className?: string;
    value: PartialSectionType;
    error: Error<SectionType> | undefined;
    onChange: (value: StateArg<PartialSectionType>, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
}
function SectionInput(props: SectionInputProps) {
    const {
        className,
        value,
        error,
        onChange,
        onRemove,
        index,
    } = props;

    const onFieldChange = useFormObject(index, onChange, defaultVal);

    return (
        <div className={className}>
            {error?.$internal && (
                <p>
                    {error.$internal}
                </p>
            )}
            <TextInput
                // FIXME: use translation
                label="Title"
                name="title"
                rows={4}
                value={value.title}
                onChange={onFieldChange}
                error={error?.fields?.title}
            />
            <Button
                name={index}
                onClick={onRemove}
                // FIXME: use translation
                title="Remove Title"
            >
                <IoClose />
            </Button>
        </div>
    );
}

interface Props {
    initialValue: Section[] | undefined;
    onCancel: () => void;
    onSave: (value: Section[]) => void;
    onChange: (value: PartialSectionType[]) => void;
}

function SectionsEditor(props: Props) {
    const {
        initialValue,
        onChange,
        onSave,
        onCancel,
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
            // NOTE: Don't let users add more that certain statements
            if (oldSections.length >= SECTIONS_LIMIT) {
                return;
            }

            const clientId = randomString();
            const newSection: PartialSectionType = {
                clientId,
            };
            onValueChange(
                [...oldSections, newSection],
                'sections' as const,
            );
        },
        [onValueChange, value.sections],
    );

    const handleSubmit = useCallback(
        (values: PartialFormType) => {
            console.log(values);
            onSave((values as FormType).sections);
        },
        [onSave],
    );

    return (
        <form
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            {value.sections?.map((section, index) => (
                <SectionInput
                    key={section.clientId}
                    index={index}
                    value={section}
                    onChange={onSectionsChange}
                    onRemove={onSectionsRemove}
                    // eslint-disable-next-line max-len
                    error={error?.fields?.sections?.members?.[section.clientId]}
                />
            ))}
            {(value.sections?.length ?? 0) < SECTIONS_LIMIT && (
                <Button
                    name={undefined}
                    onClick={handleAdd}
                    // FIXME: use strings
                >
                    Add
                </Button>
            )}
            <Button
                name={undefined}
                onClick={onCancel}
                // FIXME: use strings
            >
                Close
            </Button>
            <Button
                name={undefined}
                type="submit"
                disabled={pristine}
                // FIXME: use strings
            >
                Save
            </Button>
        </form>
    );
}
export default SectionsEditor;
