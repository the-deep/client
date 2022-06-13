import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    TextInput,
    DateInput,
    Button,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import PublicOrganizationMultiSelectInput, {
    BasicOrganization,
} from '#components/selections/PublicOrganizationMultiSelectInput';

import PublicFrameworkMultiSelectInput, {
    AnalysisFramework,
} from '#components/selections/PublicFrameworkMultiSelectInput';
import {
    ProjectListQueryVariables,
} from '#generated/types';

import styles from './styles.css';

type FormType = ProjectListQueryVariables;
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        startDate: [],
        endDate: [],
        organizations: [],
        analysisFrameworks: [],
    }),
};

const initialValue: FormType = {};

interface Props {
    className?: string;
    filters: ProjectListQueryVariables | undefined;
    onFiltersChange: (filters: ProjectListQueryVariables | undefined) => void;
}

function ProjectFilterForm(props: Props) {
    const {
        className,
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

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>();

    const [
        analysisFrameworkOptions,
        setAnalysisFrameworkOptions,
    ] = useState<AnalysisFramework[] | undefined | null>();

    const handleSubmit = useCallback(() => {
        onFiltersChange(value);
    }, [onFiltersChange, value]);

    return (
        <div className={_cs(styles.content, className)}>
            <TextInput
                name="search"
                label="Search"
                value={value?.search}
                onChange={setFieldValue}
                placeholder="any"
            />
            <DateInput
                name="startDate"
                label="Start Date"
                value={value?.startDate}
                onChange={setFieldValue}
            />
            <DateInput
                name="endDate"
                label="End Date"
                value={value?.endDate}
                onChange={setFieldValue}
            />
            <PublicOrganizationMultiSelectInput
                name="organizations"
                label="Organizations"
                value={value?.organizations}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                placeholder="any"
            />
            <PublicFrameworkMultiSelectInput
                name="analysisFrameworks"
                label="Analysis Frameworks"
                placeholder="any"
                value={value?.analysisFrameworks}
                onChange={setFieldValue}
                options={analysisFrameworkOptions}
                onOptionsChange={setAnalysisFrameworkOptions}
            />
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
                Clear
            </Button>
        </div>
    );
}

export default ProjectFilterForm;
