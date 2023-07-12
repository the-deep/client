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

import {
    enumKeySelector,
    enumLabelSelector,
} from '#utils/common';
import {
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

export interface FilterForm {
    stakeholders?: string[];
    leadOrganizations?: string[];
    sectors?: string[];
    affectedGroups?: string[];
    assessmentFrequencies?: string[];
    coordinationTypes?: string[];
}

type FormSchema = ObjectSchema<FilterForm>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        stakeholders: [],
        leadOrganizations: [],
        sectors: [],
        affectedGroups: [],
        assessmentFrequencies: [],
        coordinationTypes: [],
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
                name="stakeholders"
                value={value.stakeholders}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                disabled={loading}
                label="Stakeholders"
            />
            <OrganizationMultiSelectInput
                name="leadOrganizations"
                value={value.leadOrganizations}
                onChange={setFieldValue}
                options={organizationOptions}
                onOptionsChange={setOrganizationOptions}
                disabled={loading}
                label="Lead organizations"
            />
            <GeoMultiSelectInput
                name="leadOrganizations"
                value={value.leadOrganizations}
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
                name="affectedGroups"
                onChange={setFieldValue}
                options={data?.affectedGroupOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.affectedGroups}
                label="Affected Groups"
                placeholder="Affected Groups"
                disabled={loading}
            />
            <MultiSelectInput
                name="assessmentFrequencies"
                onChange={setFieldValue}
                options={data?.assessmentFrequencyOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.assessmentFrequencies}
                label="Assessment Frequency"
                placeholder="Assessment Frequency"
                disabled={loading}
            />
            <MultiSelectInput
                name="coordinationTypes"
                onChange={setFieldValue}
                options={data?.coordinationTypeOptions?.enumValues}
                keySelector={enumKeySelector}
                labelSelector={enumLabelSelector}
                value={value.coordinationTypes}
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
