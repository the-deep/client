import React, { useCallback, useEffect } from 'react';
import {
    Button,
    TextInput,
    Container,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
    createSubmitHandler,
    requiredStringCondition,
} from '@togglecorp/toggle-form';
import NonFieldError from '#components/ui/NonFieldError';
import { DateRangeWidget, PartialForm } from '../../types';
import styles from './styles.scss';

type FormType = DateRangeWidget;
type PartialFormType = PartialForm<
    FormType,
    'clientId' | 'type' | 'order'
>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        clientId: [],
        title: [requiredStringCondition],
        type: [],
        order: [],
        width: [],
        parent: [],
        condition: [],
    }),
};

interface DateRangeWidgetFormProps {
    onCancel: () => void;
    onSave: (value: FormType) => void;
    onChange: (value: PartialFormType) => void;
    initialValue: PartialFormType;
}

function DateRangeWidgetForm(props: DateRangeWidgetFormProps) {
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
            className={styles.form}
            onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
        >
            <Container
                heading={value?.title ?? 'Unnamed'}
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
                horizontallyCompactContent
                sub
            >
                <NonFieldError
                    className={styles.error}
                    error={error}
                />
                <TextInput
                    // FIXME: use translation
                    className={styles.input}
                    label="Title"
                    name="title"
                    autoFocus
                    value={value?.title}
                    onChange={onValueChange}
                    error={error?.fields?.title}
                />
            </Container>
        </form>
    );
}

export default DateRangeWidgetForm;
