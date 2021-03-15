import React, { useMemo, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    doesObjectHaveNoData,
    listToMap,
    mapToList,
    isDefined,
    _cs,
} from '@togglecorp/fujs';

import {
    methods,
    RequestClient,
} from '#request';
import SearchInput from '#rsci/SearchInput';
import SelectInput from '#rsci/SelectInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Button from '#rsca/Button';
import List from '#rscv/List';
import Icon from '#rscg/Icon';
import DangerButton from '#rsca/Button/DangerButton';

import {
    activeProjectIdFromStateSelector,
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    updateEntriesViewFilterAction,
    unsetEntriesViewFilterAction,

    projectDetailsSelector,
    entryFilterOptionsForProjectSelector,
    setEntryFilterOptionsAction,
} from '#redux';
import _ts from '#ts';

import FrameworkFilter from './FrameworkFilter';

import styles from './styles.scss';

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
    updateEntriesViewFilter: params => dispatch(updateEntriesViewFilterAction(params)),
    setEntryFilterOptions: params => dispatch(setEntryFilterOptionsAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
});

const commentStatusOptions = [
    {
        key: 'resolved',
        value: _ts('entries', 'resolvedCommentLabel'),
    },
    {
        key: 'unresolved',
        value: _ts('entries', 'unresolvedCommentLabel'),
    },
];

const verificationStatusOptions = [
    {
        key: true,
        value: _ts('editEntry', 'verifiedLabel'),
    },
    {
        key: false,
        value: _ts('editEntry', 'unverifiedLabel'),
    },
];

const entryTypeOptions = [
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

const staticFiltersLabelMap = {
    lead_status: _ts('entries', 'leadStatusFilterLabel'),
    lead_priority: _ts('entries', 'leadPriorityFilterLabel'),
    lead_confidentiality: _ts('entries', 'leadConfidentialityFilterLabel'),
    lead_published_on: _ts('entries', 'leadPublishedOnFilterLabel'),
    lead_assignee: _ts('entries', 'leadAssigneeFilterLabel'),

    search: _ts('entries', 'searchFilterLabel'),
    created_by: _ts('entries', 'createdByFilterLabel'),
    created_at: _ts('entries', 'createdAtFilterLabel'),
    comment_assignee: _ts('entries', 'commentAssignedToFilterLabel'),
    comment_created_by: _ts('entries', 'commentCreatedByFilterLabel'),
    comment_status: _ts('entries', 'commentStatusOptionsFilterLabel'),
    verified: _ts('entries', 'verificationStatusOptionsFilterLabel'),
    entry_type: _ts('entries', 'entryTypeFilterLabel'),

    project_entry_labels: _ts('entries', 'entryLabelsFilterLabel'),
    lead_group_label: _ts('entries', 'entryGroupsFilterLabel'),
    authoring_organization_types: _ts('entries', 'authoringOrganizationsFilterLabel'),
};

const requestOptions = {
    entryFilterOptionsRequest: {
        url: '/entry-options/',
        query: ({ props: { activeProject } }) => ({
            project: activeProject,
        }),
        onMount: true,
        method: methods.GET,
        onPropsChanged: ['activeProject'],
        onSuccess: ({ props, response }) => {
            props.setEntryFilterOptions({
                projectId: props.activeProject,
                entryFilterOptions: response,
            });
        },
    },
};

const filterKeySelector = d => d?.key;

const optionLabelSelector = d => d?.value;
const optionKeySelector = d => d?.key;
const optionTitleSelector = d => d?.title;
const optionIdSelector = d => d?.id;

function FilterEntriesForm(props) {
    const {
        entriesFilters,
        unsetEntriesViewFilter,
        setEntriesViewFilter,
        updateEntriesViewFilter,
        pending,
        className,
        entryFilterOptions,
        applyOnChange,
        hideLeadFilters,
        hideMatrixFilters,
        filters: filtersFromProps,
        widgets,
        geoOptions,
        projectDetails,
    } = props;

    const filteredFrameworkFilters = useMemo(() => {
        const widgetsMap = listToMap(widgets, d => d.key, d => d.widgetId);
        const filtersWithId = filtersFromProps.map(f => ({
            ...f,
            widgetId: widgetsMap[f.widgetKey],
        }));
        let finalFilters = [...filtersWithId];
        if (hideMatrixFilters) {
            finalFilters = finalFilters.filter(
                f => f.widgetId !== 'matrix1dWidget' && f.widgetId !== 'matrix2dWidget',
            );
        }
        return finalFilters;
    }, [filtersFromProps, widgets, hideMatrixFilters]);

    const [showFilters, setShowFilters] = useState(false);
    const [pristine, setPristine] = useState(true);
    const [filters, setFilters] = useState(entriesFilters);

    useEffect(() => {
        setPristine(true);
        setFilters(entriesFilters);
    }, [entriesFilters]);

    const handleApplyFilter = useCallback(() => {
        setEntriesViewFilter({ filters });
    }, [filters, setEntriesViewFilter]);

    const handleClearFilter = useCallback(() => {
        if (pristine || applyOnChange) {
            unsetEntriesViewFilter();
        } else {
            setFilters({});
        }
    }, [pristine, applyOnChange, unsetEntriesViewFilter, setFilters]);

    const handleFilterChange = useCallback((key, values) => {
        if (applyOnChange) {
            updateEntriesViewFilter({
                filterKey: key,
                newValue: values,
            });
        } else {
            setPristine(false);
            setFilters(oldFilters => ({
                ...oldFilters,
                [key]: values,
            }));
        }
    }, [setFilters, applyOnChange, updateEntriesViewFilter]);

    const frameworkFilterRendererParams = useCallback((key, data) => ({
        filterKey: key,
        title: data.title,
        filter: data.properties,
        value: filters[key],
        handleFilterChange,
        disabled: pending,
        regions: projectDetails.regions,
        geoOptions,
    }), [
        geoOptions,
        projectDetails,
        pending,
        filters,
        handleFilterChange,
    ]);

    const isFilterEmpty = useMemo(
        () => doesObjectHaveNoData(filters, ['']),
        [filters],
    );

    const {
        createdBy,
        projectEntryLabel,
        leadStatus,
        leadPriority,
        leadConfidentiality,
        organizationTypes,
    } = entryFilterOptions;

    const showEntryLabelFilters = projectEntryLabel && projectEntryLabel.length > 0;
    const selectedVerification = useMemo(() => (
        verificationStatusOptions.find(
            v => v.key === filters.verified,
        )
    ), [filters]);

    const handleFilterButtonClick = useCallback(() => {
        setShowFilters(oldVal => !oldVal);
    }, [setShowFilters]);

    const appliedFiltersLabel = useMemo(() => {
        const appliedFiltersKeys = mapToList(
            entriesFilters,
            (d, k) => (doesObjectHaveNoData(d, ['']) ? undefined : k),
        ).filter(isDefined);
        const frameworkFiltersTitle = listToMap(filteredFrameworkFilters, d => d.key, d => d.title);
        const allFilters = appliedFiltersKeys
            .map(f => staticFiltersLabelMap[f] ?? frameworkFiltersTitle[f])
            .filter(isDefined);

        return allFilters;
    }, [entriesFilters, filteredFrameworkFilters]);

    return (
        <div className={_cs(styles.entriesFilters, className)} >
            {showFilters && (
                <>
                    {!hideLeadFilters && (
                        <div className={styles.filtersGroup}>
                            <h4 className={styles.heading}>
                                {_ts('entries', 'leadFiltersGroupTitle')}
                            </h4>
                            <div className={styles.content}>
                                <MultiSelectInput
                                    className={styles.entriesFilter}
                                    onChange={(value) => { handleFilterChange('lead_status', value); }}
                                    keySelector={optionKeySelector}
                                    label={staticFiltersLabelMap.lead_status}
                                    labelSelector={optionLabelSelector}
                                    value={filters.lead_status}
                                    showHintAndError={false}
                                    options={leadStatus}
                                    placeholder={_ts('entries', 'leadStatusFilterPlaceholder')}
                                    disabled={pending}
                                />
                                <MultiSelectInput
                                    className={styles.entriesFilter}
                                    onChange={(value) => { handleFilterChange('lead_priority', value); }}
                                    keySelector={optionKeySelector}
                                    label={staticFiltersLabelMap.lead_priority}
                                    labelSelector={optionLabelSelector}
                                    value={filters.lead_priority}
                                    showHintAndError={false}
                                    options={leadPriority}
                                    placeholder={_ts('entries', 'leadPriorityFilterPlaceholder')}
                                    disabled={pending}
                                />
                                <MultiSelectInput
                                    className={styles.entriesFilter}
                                    onChange={(value) => { handleFilterChange('lead_confidentiality', value); }}
                                    keySelector={optionKeySelector}
                                    label={staticFiltersLabelMap.lead_confidentiality}
                                    labelSelector={optionLabelSelector}
                                    value={filters.lead_confidentiality}
                                    showHintAndError={false}
                                    options={leadConfidentiality}
                                    placeholder={_ts('entries', 'leadConfidentialityFilterPlaceholder')}
                                    disabled={pending}
                                />
                                <MultiSelectInput
                                    className={styles.entriesFilter}
                                    keySelector={optionKeySelector}
                                    labelSelector={optionLabelSelector}
                                    options={createdBy}
                                    label={staticFiltersLabelMap.lead_assignee}
                                    onChange={(value) => { handleFilterChange('lead_assignee', value); }}
                                    showHintAndError={false}
                                    value={filters.lead_assignee}
                                    disabled={pending}
                                    placeholder={_ts('entries', 'createdByPlaceholder')}
                                />
                                <DateFilter
                                    className={styles.entriesFilter}
                                    onChange={(value) => { handleFilterChange('lead_published_on', value); }}
                                    label={staticFiltersLabelMap.lead_published_on}
                                    showHintAndError={false}
                                    value={filters.lead_published_on}
                                    disabled={pending}
                                    placeholder={_ts('entries', 'leadPublishedOnPlaceholder')}
                                />
                                <MultiSelectInput
                                    className={styles.entriesFilter}
                                    keySelector={optionKeySelector}
                                    labelSelector={optionLabelSelector}
                                    options={organizationTypes}
                                    label={staticFiltersLabelMap.authoring_organization_types}
                                    onChange={(value) => { handleFilterChange('authoring_organization_types', value); }}
                                    showHintAndError={false}
                                    value={filters.authoring_organization_types}
                                    disabled={pending}
                                    placeholder={_ts('entries', 'organizationTypePlaceholder')}
                                />
                            </div>
                        </div>
                    )}
                    <div className={styles.filtersGroup}>
                        <h4 className={styles.heading}>
                            {_ts('entries', 'entriesFiltersGroupTitle')}
                        </h4>
                        <div className={styles.content}>
                            <SearchInput
                                className={styles.entriesFilter}
                                label={staticFiltersLabelMap.search}
                                onChange={(value) => { handleFilterChange('search', value); }}
                                placeholder={_ts('entries', 'searchFilterPlaceholder')}
                                showHintAndError={false}
                                value={filters.search}
                                disabled={pending}
                            />
                            <MultiSelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={createdBy}
                                label={staticFiltersLabelMap.created_by}
                                onChange={(value) => { handleFilterChange('created_by', value); }}
                                showHintAndError={false}
                                value={filters.created_by}
                                disabled={pending}
                                placeholder={_ts('entries', 'createdByPlaceholder')}
                            />
                            <DateFilter
                                className={styles.entriesFilter}
                                label={staticFiltersLabelMap.created_at}
                                onChange={(value) => { handleFilterChange('created_at', value); }}
                                showHintAndError={false}
                                value={filters.created_at}
                                disabled={pending}
                                placeholder={_ts('entries', 'createdAtPlaceholder')}
                            />
                            <MultiSelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={createdBy}
                                label={staticFiltersLabelMap.comment_assignee}
                                onChange={(value) => { handleFilterChange('comment_assignee', value); }}
                                showHintAndError={false}
                                value={filters.comment_assignee}
                                disabled={pending}
                                placeholder={_ts('entries', 'createdByPlaceholder')}
                            />
                            <MultiSelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={createdBy}
                                label={staticFiltersLabelMap.comment_created_by}
                                onChange={(value) => { handleFilterChange('comment_created_by', value); }}
                                showHintAndError={false}
                                value={filters.comment_created_by}
                                disabled={pending}
                                placeholder={_ts('entries', 'commentCreatedByPlaceholder')}
                            />
                            <SelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={commentStatusOptions}
                                label={staticFiltersLabelMap.comment_status}
                                onChange={(value) => { handleFilterChange('comment_status', value); }}
                                showHintAndError={false}
                                value={filters.comment_status}
                                disabled={pending}
                                placeholder={_ts('entries', 'commentStatusPlaceholder')}
                            />
                            <SelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={verificationStatusOptions}
                                label={staticFiltersLabelMap.verified}
                                onChange={(value) => {
                                    handleFilterChange(
                                        'verified',
                                        value,
                                    );
                                }}
                                showHintAndError={false}
                                value={(
                                    selectedVerification ? selectedVerification.key : undefined
                                )}
                                disabled={pending}
                                placeholder={_ts('entries', 'verificationStatusPlaceholder')}
                            />
                            <MultiSelectInput
                                className={styles.entriesFilter}
                                keySelector={optionKeySelector}
                                labelSelector={optionLabelSelector}
                                options={entryTypeOptions}
                                label={staticFiltersLabelMap.entry_type}
                                onChange={(value) => { handleFilterChange('entry_type', value); }}
                                showHintAndError={false}
                                value={filters.entry_type}
                                disabled={pending}
                                placeholder={_ts('entries', 'entryTypePlaceholder')}
                            />
                            {showEntryLabelFilters && (
                                <>
                                    <MultiSelectInput
                                        className={styles.entriesFilter}
                                        keySelector={optionIdSelector}
                                        labelSelector={optionTitleSelector}
                                        options={projectEntryLabel}
                                        label={staticFiltersLabelMap.project_entry_labels}
                                        onChange={(value) => { handleFilterChange('project_entry_labels', value); }}
                                        showHintAndError={false}
                                        value={filters.project_entry_labels}
                                        disabled={pending}
                                        placeholder={_ts('entries', 'entryLabelsFilterPlaceholder')}
                                    />
                                    <SearchInput
                                        className={styles.entriesFilter}
                                        label={staticFiltersLabelMap.lead_group_label}
                                        onChange={(value) => { handleFilterChange('lead_group_label', value); }}
                                        showHintAndError={false}
                                        disabled={pending}
                                        value={filters.lead_group_label}
                                        placeholder={_ts('entries', 'entryGroupsFilterPlaceholder')}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                    <div className={styles.filtersGroup}>
                        <h4 className={styles.heading}>
                            {_ts('entries', 'widgetsFiltersGroupTitle')}
                        </h4>
                        <div className={styles.content}>
                            <List
                                data={filteredFrameworkFilters}
                                keySelector={filterKeySelector}
                                renderer={FrameworkFilter}
                                rendererParams={frameworkFilterRendererParams}
                            />
                        </div>
                    </div>
                </>
            )}
            <div className={styles.actionButtons}>
                <div className={styles.leftContainer}>
                    {!showFilters && appliedFiltersLabel.length > 0 && (
                        <div className={styles.appliedFilters}>
                            <Icon name="funnel" />
                            <span className={styles.label}>
                                {_ts('entries', 'filteredByLabel')}
                            </span>
                            <span className={styles.appliedFiltersText}>
                                {appliedFiltersLabel.join(', ')}
                            </span>
                        </div>
                    )}
                    <Button
                        className={styles.button}
                        onClick={handleFilterButtonClick}
                        iconName={showFilters ? 'chevronUp' : 'chevronDown'}
                    >
                        {showFilters ? _ts('entries', 'hideFiltersLabel') : _ts('entries', 'showFiltersLabel')}
                    </Button>
                </div>
                {(!applyOnChange && showFilters) && (
                    <Button
                        className={styles.button}
                        onClick={handleApplyFilter}
                        disabled={pending || pristine}
                    >
                        {_ts('entries', 'applyFilterButtonLabel')}
                    </Button>
                )}
                <DangerButton
                    className={styles.button}
                    onClick={handleClearFilter}
                    disabled={pending || isFilterEmpty}
                >
                    {_ts('entries', 'clearFilterButtonLabel')}
                </DangerButton>
            </div>
        </div>
    );
}

FilterEntriesForm.propTypes = {
    applyOnChange: PropTypes.bool,
    filters: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    className: PropTypes.string,
    hideLeadFilters: PropTypes.bool,

    activeProject: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entryFilterOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setEntriesViewFilter: PropTypes.func.isRequired,
    updateEntriesViewFilter: PropTypes.func.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    setEntryFilterOptions: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,

    hideMatrixFilters: PropTypes.bool.isRequired,
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    // eslint-disable-next-line react/no-unused-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

FilterEntriesForm.defaultProps = {
    pending: true,
    hideLeadFilters: false,
    className: undefined,
    filters: [],
    widgets: [],
    geoOptions: {},
    applyOnChange: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestClient(requestOptions)(FilterEntriesForm),
);
