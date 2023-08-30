import React, { useMemo, useState, useCallback } from 'react';
import {
    _cs,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    Button,
    MultiSelectInput,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import GeoMultiSelectInput, { GeoArea } from '#components/GeoMultiSelectInput';
import OrganizationMultiSelectInput, {
    BasicOrganization,
} from '#components/selections/NewOrganizationMultiSelectInput';

import { EnumFix } from '#utils/types';
import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
    AssessmentDashboardFilterDataInputType,
    AssessmentFilterOptionsQuery,
    AssessmentFilterOptionsQueryVariables,
} from '#generated/types';

import styles from './styles.module.css';

const ASSESSMENT_FILTER_OPTIONS = gql`
    query AssessmentFilterOptions {
        sectorOptions: __type(name: "AssessmentRegistrySectorTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        affectedGroupOptions: __type(name: "AssessmentRegistryAffectedGroupTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        assessmentFrequencyOptions: __type(name: "AssessmentRegistryFrequencyTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
        coordinationTypeOptions: __type(name: "AssessmentRegistryCoordinationTypeEnum") {
            name
            enumValues {
                name
                description
            }
        }
    }
`;

export type FilterForm = EnumFix<AssessmentDashboardFilterDataInputType, 'sectors' | 'affectedGroup' | 'coordinationType' | 'frequency'>;

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
    initialValue: FilterForm | undefined;
    onFiltersChange: (filters: FilterForm | undefined) => void;
}

function Filters(props: Props) {
    const {
        initialValue,
        onFiltersChange,
        className,
        projectId,
    } = props;

    const {
        data,
        loading,
    } = useQuery<AssessmentFilterOptionsQuery, AssessmentFilterOptionsQueryVariables>(
        ASSESSMENT_FILTER_OPTIONS,
    );

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
                disabled={loading}
                label="Stakeholders"
            />
            <OrganizationMultiSelectInput
                name="leadOrganization"
                value={value.leadOrganization}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                disabled={loading}
                label="Lead organizations"
            />
            <GeoMultiSelectInput
                name="leadOrganization"
                value={value.leadOrganization}
                onChange={setFieldValue}
                options={geoAreaOptions}
                onOptionsChange={setGeoAreaOptions}
                disabled={loading}
                label="Location"
                projectId={projectId}
            />
            <MultiSelectInput
                name="sectors"
                onChange={setFieldValue}
                options={data?.sectorOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.sectors}
                label="Sectors"
                placeholder="Sectors"
                disabled={loading}
            />
            <MultiSelectInput
                name="affectedGroup"
                onChange={setFieldValue}
                options={data?.affectedGroupOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.affectedGroup}
                label="Affected Groups"
                placeholder="Affected Groups"
                disabled={loading}
            />
            <MultiSelectInput
                name="frequency"
                onChange={setFieldValue}
                options={data?.assessmentFrequencyOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.frequency}
                label="Assessment Frequency"
                placeholder="Assessment Frequency"
                disabled={loading}
            />
            <MultiSelectInput
                name="coordinationType"
                onChange={setFieldValue}
                options={data?.coordinationTypeOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.coordinationType}
                label="Coordination Types"
                placeholder="Coordination Types"
                disabled={loading}
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
