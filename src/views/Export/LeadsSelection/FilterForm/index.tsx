import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import {
    _cs,
    listToMap,
    isTruthyString,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import List from '#rscv/List';
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
    // EntryOptions,
    KeyValueElement,
    EmmEntity,
    // BasicElement,
    WidgetElement,
    FilterFields,
    FaramErrors,
} from '#typings';
import { notifyOnFailure } from '#utils/requestNotify';

import FrameworkFilter from '#components/other/FrameworkFilter';

import { FaramValues } from '../../ExportSelection';
import styles from './styles.scss';

const emptyList: EmmEntity[] = [];

interface BooleanKeyValueElement {
    key: boolean;
    value: string;
}
const verificationStatusOptions: BooleanKeyValueElement[] = [
    {
        key: true,
        value: _ts('editEntry', 'verifiedLabel'),
    },
    {
        key: false,
        value: _ts('editEntry', 'unverifiedLabel'),
    },
];

const entryTypeOptions: KeyValueElement[] = [
    {
        key: 'excerpt',
        value: _ts('entries', 'excerpt'),
    },
    {
        key: 'image',
        value: _ts('entries', 'image'),
    },
    {
        key: 'dataSeries',
        value: _ts('entries', 'dataSeries'),
    },
];
const commentStatusOptions: KeyValueElement[] = [
    {
        key: 'resolved',
        value: _ts('entries', 'resolvedCommentLabel'),
    },
    {
        key: 'unresolved',
        value: _ts('entries', 'unresolvedCommentLabel'),
    },
];
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

interface OwnProps {
    className?: string;
    projectId: number;
    filterOnlyUnprotected?: boolean;
    filterValues: FaramValues;
    entriesFilters?: FilterFields[];
    entriesWidgets?: WidgetElement<unknown>[];
    onChange: (filter: FaramValues) => void;
    regions?: unknown[];
    geoOptions?: unknown;
    hasAssessment?: boolean;
    setFiltersPending?: (pending: boolean) => void;
}

const filterKeySelector = (d: FilterFields) => d.key;
// const optionTitleSelector = (d: BasicElement) => d.title;
// const optionIdSelector = (d: BasicElement) => d.id;
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
        entriesFilters,
        entriesWidgets,
        onChange,
        filterOnlyUnprotected,
        regions,
        geoOptions,
        hasAssessment,
        setFiltersPending,
    } = props;

    const schema = useMemo(() => {
        const leadSchema = {
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
        };
        if (hasAssessment) {
            return {
                fields: {
                    ...leadSchema,
                },
            };
        }
        return {
            fields: {
                ...leadSchema,
                entries_filter: {
                    fields: {
                        created_at: [],
                        created_by: [],
                        comment_assignee: [],
                        comment_created_by: [],
                        comment_status: [],
                        verified: [],
                        entry_type: [],
                        project_entry_labels: [],
                        lead_group_label: [],
                        ...listToMap(entriesFilters, v => v.key, () => []),
                    },
                },
            },
        };
    }, [entriesFilters, hasAssessment]);

    const [faramValues, setFaramValues] = useState<FaramValues>(filterValues);
    const [faramErrors, setFaramErrors] = useState<FaramErrors>({});
    const [showAllFilters, setShowAllFilters] = useState(false);
    const [pristine, setPristine] = useState(true);

    const filteredFrameworkFilters = useMemo(() => {
        const widgetsMap = listToMap(entriesWidgets, d => d.key, d => d.widgetId);
        const filtersWithId = entriesFilters?.map(f => ({
            ...f,
            widgetId: widgetsMap[f.widgetKey],
        }));
        return filtersWithId ?? [];
    }, [entriesWidgets, entriesFilters]);

    const frameworkFilterRendererParams = useCallback((key, data) => ({
        filterKey: key,
        title: data.title,
        filter: data.properties,
        regions,
        geoOptions,
    }), [
        regions,
        geoOptions,
    ]);

    const [
        leadOptionsPending,
        leadOptions,
    ] = useRequest<LeadOptions>({
        url: 'server://lead-options/',
        query: {
            projects: [projectId],
        },
        autoTrigger: true,
        method: 'GET',
        schemaName: 'projectLeadFilterOptions',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'leadOptions'))({ error: errorBody });
        },
    });

    /*
    const [
        ,
        entryOptions,
    ] = useRequest<EntryOptions>({
        url: 'server://entry-options/',
        query: {
            projects: [projectId],
        },
        autoTrigger: true,
        method: 'GET',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'entryOptions'))({ error: errorBody });
        },
    });
     */

    useEffect(() => {
        if (setFiltersPending) {
            setFiltersPending(leadOptionsPending);
        }
    }, [setFiltersPending, leadOptionsPending]);

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

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(filterOnlyUnprotected
            ? { ...faramValues, confidentiality: undefined }
            : faramValues, [''])
    ), [faramValues, filterOnlyUnprotected]);

    const isClearDisabled = isFilterEmpty && pristine;

    const handleFaramChange = useCallback((newValues) => {
        setFaramValues(newValues);
        setPristine(false);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, finalValues) => {
        onChange(finalValues);
        setPristine(true);
    }, [onChange]);

    const handleClearFilters = useCallback(() => {
        setFaramValues({});
        onChange({});
        setPristine(true);
    }, [onChange]);

    const pending = leadOptionsPending;
    // NOTE: Removed because project labels/groups are less used features
    // const showEntryLabelFilters = entryOptions && entryOptions.projectEntryLabel?.length > 0;

    const handleFilterButtonClick = useCallback(() => {
        setShowAllFilters(oldVal => !oldVal);
    }, [setShowAllFilters]);

    return (
        <Faram
            className={_cs(styles.leadsFilters, className)}
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={pending}
            onValidationSuccess={handleFaramValidationSuccess}
            onValidationFailure={setFaramErrors}
            onChange={handleFaramChange}
        >
            <div className={styles.filter}>
                <SearchInput
                    faramElementName="search"
                    label={_ts('leads', 'placeholderSearch')}
                    placeholder={_ts('leads', 'placeholderSearch')}
                    showHintAndError={false}
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="published_on"
                    label={_ts('leads', 'filterDatePublished')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
                    className={styles.leadsFilter}
                />
                {!hasAssessment && (
                    <SelectInput
                        faramElementName="exists"
                        keySelector={optionKeySelector}
                        label={_ts('leads', 'existsFilterLabel')}
                        labelSelector={optionLabelSelector}
                        options={existsFilterOptions}
                        placeholder={_ts('leads', 'placeholderAny')}
                        showHintAndError={false}
                        disabled={pending}
                        className={styles.leadsFilter}
                    />
                )}
                <MultiSelectInput
                    faramElementName="assignee"
                    keySelector={optionKeySelector}
                    label={_ts('leads', 'assigneeLabel')}
                    labelSelector={optionLabelSelector}
                    options={assignee}
                    placeholder={_ts('leads', 'placeholderAnybody')}
                    showHintAndError={false}
                    className={styles.leadsFilter}
                />
                <DateFilter
                    faramElementName="created_at"
                    label={_ts('leads', 'filterDateCreated')}
                    placeholder={_ts('leads', 'placeholderAnytime')}
                    showHintAndError={false}
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
                            className={styles.leadsFilter}
                        />
                    </React.Fragment>
                )}
            </div>
            { showAllFilters && !hasAssessment && (
                <FaramGroup faramElementName="entries_filter">
                    <div>
                        <h4 className={styles.heading}>
                            {_ts('entries', 'entriesFiltersGroupTitle')}
                        </h4>
                        <div className={styles.filter}>
                            <MultiSelectInput
                                faramElementName="created_by"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={assignee}
                                label={_ts('entries', 'createdByFilterLabel')}
                                placeholder={_ts('entries', 'createdByPlaceholder')}
                                showHintAndError={false}
                                className={styles.leadsFilter}
                            />
                            <DateFilter
                                faramElementName="created_at"
                                label={_ts('entries', 'createdAtFilterLabel')}
                                placeholder={_ts('leads', 'placeholderAnytime')}
                                showHintAndError={false}
                                className={styles.leadsFilter}
                            />
                            <MultiSelectInput
                                faramElementName="comment_assignee"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={assignee}
                                label={_ts('entries', 'commentAssignedToFilterLabel')}
                                placeholder={_ts('entries', 'createdByPlaceholder')}
                                showHintAndError={false}
                                className={styles.leadsFilter}
                            />
                            <MultiSelectInput
                                faramElementName="comment_created_by"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={assignee}
                                label={_ts('entries', 'commentCreatedByFilterLabel')}
                                showHintAndError={false}
                                placeholder={_ts('entries', 'commentCreatedByPlaceholder')}
                                className={styles.leadsFilter}
                            />
                            <SelectInput
                                faramElementName="comment_status"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={commentStatusOptions}
                                label={_ts('entries', 'commentStatusOptionsFilterLabel')}
                                placeholder={_ts('entries', 'commentStatusPlaceholder')}
                                showHintAndError={false}
                                className={styles.leadsFilter}
                            />
                            <SelectInput
                                faramElementName="verified"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={verificationStatusOptions}
                                label={_ts('entries', 'verificationStatusOptionsFilterLabel')}
                                showHintAndError={false}
                                placeholder={_ts('entries', 'verificationStatusPlaceholder')}
                                className={styles.leadsFilter}
                            />
                            <MultiSelectInput
                                faramElementName="entry_type"
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={entryTypeOptions}
                                label={_ts('entries', 'entryTypeFilterLabel')}
                                showHintAndError={false}
                                placeholder={_ts('entries', 'entryTypePlaceholder')}
                                className={styles.leadsFilter}
                            />
                            {/*
                                showEntryLabelFilters && (
                                <>
                                    <MultiSelectInput
                                        faramElementName="project_entry_labels"
                                        keySelector={optionIdSelector}
                                        labelSelector={optionTitleSelector}
                                        options={entryOptions?.projectEntryLabel}
                                        label={_ts('entries', 'entryLabelsFilterLabel')}
                                        showHintAndError={false}
                                        placeholder={_ts('entries', 'entryLabelsFilterPlaceholder')}
                                        className={styles.leadsFilter}
                                    />
                                    <SearchInput
                                        faramElementName="lead_group_label"
                                        label={_ts('entries', 'entryGroupsFilterLabel')}
                                        placeholder={_ts('entries', 'entryGroupsFilterPlaceholder')}
                                        showHintAndError={false}
                                        className={styles.leadsFilter}
                                    />
                                </>
                                )
                              */}
                        </div>
                    </div>
                    { filteredFrameworkFilters.length > 0 && (
                        <div>
                            <h4 className={styles.heading}>
                                {_ts('entries', 'widgetsFiltersGroupTitle')}
                            </h4>
                            <div className={styles.filter}>
                                <List
                                    data={filteredFrameworkFilters}
                                    keySelector={filterKeySelector}
                                    renderer={FrameworkFilter}
                                    rendererParams={frameworkFilterRendererParams}
                                    rendererClassName={styles.leadsFilter}
                                />
                            </div>
                        </div>
                    )}
                </FaramGroup>
            )}
            <div className={styles.actionButtons}>
                {!hasAssessment && (
                    <Button
                        className={styles.button}
                        onClick={handleFilterButtonClick}
                        iconName={showAllFilters ? 'chevronUp' : 'chevronDown'}
                    >
                        {showAllFilters
                            ? _ts('export', 'hideAllFiltersLabel')
                            : _ts('export', 'showAllFiltersLabel')
                        }
                    </Button>
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
            </div>
        </Faram>
    );
}

export default FilterForm;
