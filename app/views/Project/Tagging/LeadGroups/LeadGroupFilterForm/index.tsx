import React, { useCallback, useMemo, useEffect } from 'react';
import { doesObjectHaveNoData } from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    TextInput,
    DateDualRangeInput,
    Button,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import {
    LeadGroupListQueryVariables,
} from '#generated/types';

import styles from './styles.css';

type FormType = Omit<LeadGroupListQueryVariables, 'projectId'>;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        startDate: [],
        endDate: [],
    }),
};

const initialValue: FormType = {};

interface Props {
    filters: Omit<LeadGroupListQueryVariables, 'projectId'> | undefined;
    onFiltersChange: (filters: Omit<LeadGroupListQueryVariables, 'projectId'> | undefined) => void;
}

function LeadGroupFilterForm(props: Props) {
    const {
        filters,
        onFiltersChange,
    } = props;

    const {
        pristine,
        value,
        setValue,
        setFieldValue,
    } = useForm(schema, initialValue);

    useEffect(() => {
        setValue(filters ?? initialValue);
    }, [filters, setValue]);

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

    const isClearDisabled = isFilterEmpty && pristine;

    const handleClearFilters = useCallback(() => {
        onFiltersChange({});
    }, [onFiltersChange]);

    const handleSubmit = useCallback(() => {
        onFiltersChange(value);
    }, [onFiltersChange, value]);

    return (
        <div className={styles.content}>
            <div className={styles.filters}>
                <TextInput
                    name="search"
                    label="Search"
                    value={value.search}
                    onChange={setFieldValue}
                    placeholder="any"
                />
                <DateDualRangeInput
                    label="Created At"
                    fromName="startDate"
                    toName="endDate"
                    fromOnChange={setFieldValue}
                    toOnChange={setFieldValue}
                    fromValue={value.startDate}
                    toValue={value.endDate}
                />
            </div>
            <div className={styles.buttonContainer}>
                <Button
                    name={undefined}
                    onClick={handleSubmit}
                    disabled={pristine}
                    variant="transparent"
                >
                    Apply
                </Button>
                <Button
                    name={undefined}
                    disabled={isClearDisabled}
                    onClick={handleClearFilters}
                    actions={<IoClose />}
                    variant="transparent"
                >
                    Clear All
                </Button>
            </div>
        </div>
    );
}

export default LeadGroupFilterForm;
