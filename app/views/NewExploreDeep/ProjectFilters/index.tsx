import React, { useCallback, useMemo, useEffect, useState } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import { IoClose } from 'react-icons/io5';
import {
    TextInput,
    Container,
    Button,
    Checkbox,
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

import RegionMultiSelectInput, {
    BasicRegion,
} from '#components/selections/RegionMultiSelectInput';

import styles from './styles.css';

export type FormType = {
    search?: string;
    organizations?: string[];
    analysisFrameworks?: string[];
    regions?: string[];
    excludeTestProject?: boolean;
    excludeProjectsLessThan?: boolean;
};

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        search: [],
        organizations: [],
        analysisFrameworks: [],
        regions: [],
    }),
};

const initialValue: FormType = {};

interface Props {
    className?: string;
    filters: FormType | undefined;
    onFiltersChange: (filters: FormType | undefined) => void;
}

function ProjectFilters(props: Props) {
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

    const [
        regionOptions,
        setRegionOptions,
    ] = useState<BasicRegion[] | undefined | null>();

    const handleSubmit = useCallback(() => {
        onFiltersChange(value);
    }, [onFiltersChange, value]);

    return (
        <div className={_cs(styles.projectFilters, className)}>
            <TextInput
                name="search"
                label="Search"
                value={value?.search}
                onChange={setFieldValue}
                placeholder="any"
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
            <RegionMultiSelectInput
                name="regions"
                label="Location"
                placeholder="any"
                value={value?.regions}
                onChange={setFieldValue}
                options={regionOptions}
                onOptionsChange={setRegionOptions}
                publicRegions
            />
            <Container
                className={styles.excludeContainer}
                heading="Exclude"
                headingSize="extraSmall"
                spacing="compact"
                contentClassName={styles.excludeContent}
            >
                <Checkbox
                    name="excludeTestProject"
                    label="Test Project"
                    value={value?.excludeTestProject}
                    onChange={setFieldValue}
                />
                <Checkbox
                    name="excludeProjectsLessThan"
                    label="Projects < 100 entries"
                    value={value?.excludeProjectsLessThan}
                    onChange={setFieldValue}
                />
            </Container>
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

export default ProjectFilters;
