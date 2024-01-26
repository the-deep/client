import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    Button,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import { EnumOptions } from '#types/common';
import { enumKeySelector, enumLabelSelector } from '#utils/common';
import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import OrganizationMultiSelectInput, {
    BasicOrganization,
} from '#components/selections/NewOrganizationMultiSelectInput';
import {
    ProjectMetadataForAryQuery,
    AssessmentDashboardFilterDataInputType,
    AssessmentRegistryAffectedGroupTypeEnum,
    AssessmentRegistryCoordinationTypeEnum,
    AssessmentRegistryFrequencyTypeEnum,
    AssessmentRegistrySectorTypeEnum,
} from '#generated/types';

import styles from './styles.module.css';

export type FilterForm = AssessmentDashboardFilterDataInputType;

type FormSchema = ObjectSchema<FilterForm>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        stakeholder: [],
        leadOrganization: [],
        sectors: [],
        affectedGroup: [],
        frequency: [],
        coordinationType: [],
    }),
};

interface Props {
    className?: string;
    projectId: string;
    options?: ProjectMetadataForAryQuery;
    initialValue: FilterForm | undefined;
    onFiltersChange: (filters: FilterForm | undefined) => void;
}

function Filters(props: Props) {
    const {
        initialValue,
        onFiltersChange,
        className,
        options,
        projectId,
    } = props;

    const [
        organizationOptions,
        setOrganizationOptions,
    ] = useState<BasicOrganization[] | undefined | null>([]);

    const [
        geoAreaOptions,
        setGeoAreaOptions,
    ] = useState<GeoArea[] | undefined | null>([]);
    const {
        pristine,
        value,
        setFieldValue,
        setValue,
        setPristine,
    } = useForm(schema, initialValue ?? {} as FilterForm);

    const [
        sectorOptions,
        affectedGroupOptions,
        frequencyOptions,
        coordinationOptions,
    ] = useMemo(() => ([
        options?.sectorOptions?.enumValues as EnumOptions<AssessmentRegistrySectorTypeEnum>,
        options?.affectedGroupOptions?.enumValues as EnumOptions<
            AssessmentRegistryAffectedGroupTypeEnum
        >,
        options?.assessmentFrequencyOptions?.enumValues as EnumOptions<
            AssessmentRegistryFrequencyTypeEnum
        >,
        options?.coordinationTypeOptions?.enumValues as EnumOptions<
            AssessmentRegistryCoordinationTypeEnum
        >,
    ]), [options]);

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

    const handleSubmit = useCallback(() => {
        setPristine(true);
        onFiltersChange(value);
    }, [
        onFiltersChange,
        value,
        setPristine,
    ]);

    const handleClearFilters = useCallback(() => {
        onFiltersChange({});
        setPristine(true);
        setValue({});
    }, [
        setPristine,
        onFiltersChange,
        setValue,
    ]);

    const isClearDisabled = isFilterEmpty && pristine;

    return (
        <div className={_cs(styles.filters, className)}>
            <OrganizationMultiSelectInput
                name="stakeholder"
                value={value.stakeholder}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                label="Stakeholders"
            />
            <OrganizationMultiSelectInput
                name="leadOrganization"
                value={value.leadOrganization}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                label="Lead organizations"
            />
            <GeoMultiSelectInput
                name="location"
                value={value.location}
                onChange={setFieldValue}
                options={geoAreaOptions}
                onOptionsChange={setGeoAreaOptions}
                label="Location"
                projectId={projectId}
            />
            <MultiSelectInput
                name="sectors"
                onChange={setFieldValue}
                options={sectorOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.sectors}
                label="Sectors"
                placeholder="Sectors"
            />
            <MultiSelectInput
                name="affectedGroup"
                onChange={setFieldValue}
                options={affectedGroupOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.affectedGroup}
                label="Affected Groups"
                placeholder="Affected Groups"
            />
            <MultiSelectInput
                name="frequency"
                onChange={setFieldValue}
                options={frequencyOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.frequency}
                label="Assessment Frequency"
                placeholder="Assessment Frequency"
            />
            <MultiSelectInput
                name="coordinationType"
                onChange={setFieldValue}
                options={coordinationOptions}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.coordinationType}
                label="Coordination Types"
                placeholder="Coordination Types"
            />
            <Button
                name={undefined}
                disabled={isClearDisabled}
                onClick={handleClearFilters}
                variant="secondary"
                spacing="compact"
            >
                Clear
            </Button>
            <Button
                name={undefined}
                onClick={handleSubmit}
                disabled={pristine}
                variant="primary"
                spacing="compact"
            >
                Apply
            </Button>
        </div>
    );
}

export default Filters;
