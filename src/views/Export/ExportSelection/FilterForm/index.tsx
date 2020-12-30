import React, { useState, useMemo, useCallback } from 'react';
import Faram from '@togglecorp/faram';
import {
    _cs,
    isTruthyString,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import SearchInput from '#rsci/SearchInput';
import DateFilter from '#rsci/DateFilter';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import SearchMultiSelectInput from '#rsci/SearchMultiSelectInput';

import useRequest from '#utils/request';
import _ts from '#ts';
import {
    LeadOptions,
    KeyValueElement,
    EmmEntity,
} from '#typings';

import styles from './styles.scss';

const emptyList: EmmEntity[] = [];

const existsFilterOptions: KeyValueElement[] = [
    {
        key: 'assessment_exists',
        value: _ts('leads', 'assessmentExistsOptionLabel'),
    },
    {
        key: 'assessment_does_not_exist',
        value: _ts('leads', 'assessmentDoesNotExistsOptionLabel'),
    },
];

interface FilterValues {
}

interface OwnProps {
    className?: string;
    projectId: number;
    filterOnlyUnprotected?: boolean;
    filterValues: FilterValues;
}

const optionLabelSelector = (d: KeyValueElement) => d.value;
const optionKeySelector = (d: KeyValueElement) => d.key;
const emmRiskFactorsKeySelector = (d: KeyValueElement) => (isTruthyString(d.key) ? d.key : 'None');
const emmRiskFactorsLabelSelector = (d: EmmEntity) => (isTruthyString(d.label)
    ? `${d.label} (${d.totalCount})`
    : `None (${d.totalCount})`
);

const emmEntitiesKeySelector = (d: EmmEntity) => d.key;
const emmEntitiesLabelSelector = (d: EmmEntity) => `${d.label} (${d.totalCount})`;
const emmTriggerKeySelector = (d: EmmEntity) => d.key;
const emmTriggerLabelSelector = (d: EmmEntity) => `${d.label} (${d.totalCount})`;

function FilterForm(props: OwnProps) {
    const {
        className,
        projectId,
        filterValues,
        onChange,
        filterOnlyUnprotected,
    } = props;

    const schema = useMemo(() => ({
        fields: {
            search: [],
            assignee: [],
            created_at: [],
            published_on: [],
            confidentiality: [],
            status: [],
            priority: [],
            authoring_organization_types: [],
            exists: [],
            emm_risk_factors: [],
            emm_keywords: [],
            emm_entities: [],
        },
    }), []);

    const [faramValues, setFaramValues] = useState<FilterValues>(filterValues);
    const [pristine, setPristine] = useState(true);

    const [
        pending,
        leadOptions,
        ,
    ] = useRequest<LeadOptions>({
        url: 'server://lead-options/',
        query: {
            projects: [projectId],
        },
        autoTrigger: true,
        method: 'GET',
        schemaName: 'projectLeadFilterOptions',
    });

    const {
        confidentiality,
        status,
        assignee,
        priority,
        organizationTypes,
        emmEntities = emptyList,
        emmKeywords = emptyList,
        emmRiskFactors = emptyList,
        hasEmmLeads,
    } = leadOptions || {};

    const isFilterEmpty = useMemo(() => {
        let isFilterEmptyValue;

        if (filterOnlyUnprotected) {
            let newFilter = {
                ...faramValues,
                confidentiality: undefined,
            };

            isFilterEmptyValue = doesObjectHaveNoData(newFilter, ['']);

            newFilter = {
                ...faramValues,
                confidentiality: ['unprotected'],
            };
        } else {
            isFilterEmptyValue = doesObjectHaveNoData(faramValues, ['']);
        }
        return isFilterEmptyValue;
    }, [faramValues, filterOnlyUnprotected]);

    const isClearDisabled = isFilterEmpty && pristine;

    const handleFaramChange = useCallback((newValues) => {
        setFaramValues(newValues);
        setPristine(false);
    }, []);

    const handleFaramValidationSuccess = useCallback((finalValues) => {
        onChange(finalValues);
        setPristine(true);
    }, [onChange]);

    const handleClearFilters = useCallback(() => {
        setFaramValues({});
        onChange({});
        setPristine(true);
    }, [onChange]);

    return (
        <div className={_cs(className, styles.filterForm)}>
            <Faram
                className={_cs(styles.leadsFilters, className)}
                onValidationSuccess={handleFaramValidationSuccess}
                onChange={handleFaramChange}
                schema={schema}
                value={faramValues}
                disabled={pending}
            >
                <SearchInput
                    faramElementName="search"
                    label={_ts('leads', 'placeholderSearch')}
                    placeholder={_ts('leads', 'placeholderSearch')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="published_on"
                    label={_ts('leads', 'filterDatePublished')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <SelectInput
                    faramElementName="exists"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'existsFilterLabel')}
                    labelSelector={optionLabelSelector}
                    options={existsFilterOptions}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <MultiSelectInput
                    faramElementName="assignee"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'assigneeLabel')}
                    labelSelector={optionLabelSelector}
                    options={assignee}
                    placeholder={_ts('leads', 'placeholderAnybody')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('leads', 'filterDateCreated')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                {!filterOnlyUnprotected && (
                    <MultiSelectInput
                        faramElementName="confidentiality"
                        keySelector={optionKeySelector}
                        label={_ts('leads', 'filterConfidentiality')}
                        labelSelector={optionLabelSelector}
                        options={confidentiality}
                        placeholder={_ts('leads', 'placeholderAny')}
                        showHintAndError={false}
                        showLabel
                        className={styles.leadsFilter}
                    />
                )}
                <MultiSelectInput
                    faramElementName="priority"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'filterPriority')}
                    labelSelector={optionLabelSelector}
                    options={priority}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <MultiSelectInput
                    faramElementName="status"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'filterStatus')}
                    labelSelector={optionLabelSelector}
                    options={status}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                <MultiSelectInput
                    faramElementName="authoring_organization_types"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'filterOrganizationType')}
                    labelSelector={optionLabelSelector}
                    options={organizationTypes}
                    placeholder={_ts('leads', 'placeholderAny')}
                    showHintAndError={false}
                    showLabel
                    className={styles.leadsFilter}
                />
                {hasEmmLeads && (
                    <React.Fragment>
                        <SearchMultiSelectInput
                            faramElementName="emm_risk_factors"
                            keySelector={emmRiskFactorsKeySelector}
                            label={_ts('leads', 'filterEmmRiskFactors')}
                            labelSelector={emmRiskFactorsLabelSelector}
                            options={emmRiskFactors}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            showLabel
                            className={styles.leadsFilter}
                        />
                        <SearchMultiSelectInput
                            faramElementName="emm_keywords"
                            keySelector={emmTriggerKeySelector}
                            label={_ts('leads', 'filterEmmTriggers')}
                            labelSelector={emmTriggerLabelSelector}
                            options={emmKeywords}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            showLabel
                            className={styles.leadsFilter}
                        />
                        <SearchMultiSelectInput
                            faramElementName="emm_entities"
                            keySelector={emmEntitiesKeySelector}
                            label={_ts('leads', 'filterEmmEntities')}
                            labelSelector={emmEntitiesLabelSelector}
                            options={emmEntities}
                            placeholder={_ts('leads', 'placeholderAny')}
                            showHintAndError={false}
                            showLabel
                            className={styles.leadsFilter}
                        />
                    </React.Fragment>
                )}
                <Button
                    className={styles.button}
                    disabled={pristine || pending}
                    type="submit"
                >
                    {_ts('leads', 'filterApplyFilter')}
                </Button>
                <DangerButton
                    className={styles.button}
                    disabled={isClearDisabled || pending}
                    onClick={handleClearFilters}
                >
                    {_ts('leads', 'filterClearFilter')}
                </DangerButton>
            </Faram>
        </div>
    );
}

export default FilterForm;
