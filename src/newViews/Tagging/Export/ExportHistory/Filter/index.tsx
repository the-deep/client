import React, { useCallback } from 'react';
import { _cs, isDefined } from '@togglecorp/fujs';
import {
    IoSearch,
    IoClose,
} from 'react-icons/io5';
import {
    useForm,
    PartialForm,
    ObjectSchema,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    TextInput,
    DateInput,
} from '@the-deep/deep-ui';

import styles from './styles.scss';

export type FormType = {
    search?: string;
    createdOn?: string;
};
type FormSchema = ObjectSchema<PartialForm<FormType>>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: ():FormSchemaFields => ({
        search: [],
        createdOn: [],
    }),
};

const defaultFormValue: PartialForm<FormType> = {};

interface Props {
    className?: string;
    onFilterApply: (values?: FormType) => void;
    disabled?: boolean;
}

function Filter(props: Props) {
    const {
        className,
        onFilterApply,
        disabled,
    } = props;

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setValue,
        setError,
    } = useForm(schema, defaultFormValue);

    const error = getErrorObject(riskyError);

    const handleApply = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            onFilterApply(val);
        }
    }, [setError, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        setValue(defaultFormValue);
        onFilterApply(undefined);
    }, [setValue, onFilterApply]);

    return (
        <div className={_cs(className, styles.exportFilter)}>
            <DateInput
                className={styles.input}
                name="createdOn"
                label="Created On"
                value={value.createdOn}
                onChange={setFieldValue}
                error={error?.createdOn}
                disabled={disabled}
            />
            <TextInput
                className={styles.input}
                icons={<IoSearch />}
                label="Search"
                name="search"
                placeholder="Search"
                value={value.search}
                onChange={setFieldValue}
                error={error?.search}
                disabled={disabled}
            />
            <Button
                className={styles.button}
                name="applyFilter"
                variant="action"
                disabled={disabled || pristine}
                onClick={handleApply}
            >
                Filter
            </Button>
            <Button
                className={styles.button}
                disabled={disabled || pristine}
                name="clearFilter"
                variant="action"
                actions={<IoClose />}
                onClick={handleClear}
            >
                Clear
            </Button>
        </div>
    );
}

export default Filter;
