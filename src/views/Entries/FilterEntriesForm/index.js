import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    methods,
    RequestClient,
} from '#request';
import {
    doesObjectHaveNoData,
    _cs,
} from '@togglecorp/fujs';
import SearchInput from '#rsci/SearchInput';
import SelectInput from '#rsci/SelectInput';
import DateFilter from '#rsci/DateFilter';
import MultiSelectInput from '#rsci/MultiSelectInput';
import Button from '#rsca/Button';
import List from '#rscv/List';
import DangerButton from '#rsca/Button/DangerButton';

import {
    activeProjectIdFromStateSelector,
    entriesViewFilterSelector,
    setEntriesViewFilterAction,
    unsetEntriesViewFilterAction,

    projectDetailsSelector,
    entryFilterOptionsForProjectSelector,
    setEntryFilterOptionsAction,
} from '#redux';
import _ts from '#ts';

import FrameworkFilter from './FrameworkFilter';

import styles from './styles.scss';

const emptyList = [];

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    entryFilterOptions: entryFilterOptionsForProjectSelector(state),
    projectDetails: projectDetailsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntriesViewFilter: params => dispatch(setEntriesViewFilterAction(params)),
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

const filterKeySelector = (d = {}) => d.key;

const optionLabelSelector = (d = {}) => d.value;
const optionKeySelector = (d = {}) => d.key;
const optionTitleSelector = (d = {}) => d.title;
const optionIdSelector = (d = {}) => d.id;

function FilterEntriesForm(props) {
    const {
        entriesFilters,
        unsetEntriesViewFilter,
        setEntriesViewFilter,
        pending,
        className,
        entryFilterOptions,
        applyOnChange,
        hideLeadFilters,
        filters: filtersFromProps,
        geoOptions,
        projectDetails,
    } = props;

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
        if (pristine) {
            unsetEntriesViewFilter();
        } else {
            setFilters({});
        }
    }, [pristine, unsetEntriesViewFilter, setFilters]);

    const handleFilterChange = useCallback((key, values) => {
        setPristine(false);
        setFilters(oldFilters => ({
            ...oldFilters,
            ...{ [key]: values },
        }));

        if (applyOnChange) {
            handleApplyFilter();
        }
    }, [setFilters, handleApplyFilter, applyOnChange]);

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

    const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

    const {
        createdBy,
        projectEntryLabel,
        leadStatus,
        leadPriority,
        leadConfidentiality,
    } = entryFilterOptions;

    const showEntryLabelFilters = projectEntryLabel && projectEntryLabel.length > 0;
    const selectedVerification = verificationStatusOptions.find(
        v => v.key === filters.verified,
    );

    return (
        <div className={_cs(styles.entriesFilters, className)} >
            {!hideLeadFilters && (
                <div className={styles.filtersGroup}>
                    <h4 className={styles.heading}>
                        {_ts('entries', 'leadFiltersGroupTitle')}
                    </h4>
                    <MultiSelectInput
                        className={styles.entriesFilter}
                        onChange={(value) => { handleFilterChange('lead_status', value); }}
                        keySelector={optionKeySelector}
                        label={_ts('entries', 'leadStatusFilterLabel')}
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
                        label={_ts('entries', 'leadPriorityFilterLabel')}
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
                        label={_ts('entries', 'leadConfidentialityFilterLabel')}
                        labelSelector={optionLabelSelector}
                        value={filters.lead_confidentiality}
                        showHintAndError={false}
                        options={leadConfidentiality}
                        placeholder={_ts('entries', 'leadConfidentialityFilterPlaceholder')}
                        disabled={pending}
                    />
                    <DateFilter
                        className={styles.entriesFilter}
                        label={_ts('entries', 'leadPublishedOnFilterLabel')}
                        onChange={(value) => { handleFilterChange('lead_published_on', value); }}
                        showHintAndError={false}
                        value={filters.lead_published_on}
                        disabled={pending}
                        placeholder={_ts('entries', 'leadPublishedOnPlaceholder')}
                    />
                </div>
            )}
            <div className={styles.filtersGroup}>
                <h4 className={styles.heading}>
                    {_ts('entries', 'entriesFiltersGroupTitle')}
                </h4>
                <SearchInput
                    className={styles.entriesFilter}
                    label={_ts('entries', 'searchFilterLabel')}
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
                    label={_ts('entries', 'createdByFilterLabel')}
                    onChange={(value) => { handleFilterChange('created_by', value); }}
                    showHintAndError={false}
                    value={filters.created_by || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'createdByPlaceholder')}
                />
                <DateFilter
                    className={styles.entriesFilter}
                    label={_ts('entries', 'createdAtFilterLabel')}
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
                    label={_ts('entries', 'commentAssignedToFilterLabel')}
                    onChange={(value) => { handleFilterChange('comment_assignee', value); }}
                    showHintAndError={false}
                    value={filters.comment_assignee || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'createdByPlaceholder')}
                />
                <MultiSelectInput
                    className={styles.entriesFilter}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    options={createdBy}
                    label={_ts('entries', 'commentCreatedByFilterLabel')}
                    onChange={(value) => { handleFilterChange('comment_created_by', value); }}
                    showHintAndError={false}
                    value={filters.comment_created_by || emptyList}
                    disabled={pending}
                    placeholder={_ts('entries', 'commentCreatedByPlaceholder')}
                />
                <SelectInput
                    className={styles.entriesFilter}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    options={commentStatusOptions}
                    label={_ts('entries', 'commentStatusOptionsFilterLabel')}
                    onChange={(value) => { handleFilterChange('comment_status', value); }}
                    showHintAndError={false}
                    value={filters.comment_status || undefined}
                    disabled={pending}
                    placeholder={_ts('entries', 'commentStatusPlaceholder')}
                />
                <SelectInput
                    className={styles.entriesFilter}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    options={verificationStatusOptions}
                    label={_ts('entries', 'verificationStatusOptionsFilterLabel')}
                    onChange={(value) => {
                        handleFilterChange(
                            'verified',
                            value,
                        );
                    }}
                    showHintAndError={false}
                    value={(selectedVerification ? selectedVerification.key : undefined)}
                    disabled={pending}
                    placeholder={_ts('entries', 'verificationStatusPlaceholder')}
                />
                <MultiSelectInput
                    className={styles.entriesFilter}
                    keySelector={optionKeySelector}
                    labelSelector={optionLabelSelector}
                    options={entryTypeOptions}
                    label={_ts('entries', 'entryTypeFilterLabel')}
                    onChange={(value) => { handleFilterChange('entry_type', value); }}
                    showHintAndError={false}
                    value={filters.entry_type || emptyList}
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
                            label={_ts('entries', 'entryLabelsFilterLabel')}
                            onChange={(value) => { handleFilterChange('project_entry_labels', value); }}
                            showHintAndError={false}
                            value={filters.project_entry_labels || emptyList}
                            disabled={pending}
                            placeholder={_ts('entries', 'entryLabelsFilterPlaceholder')}
                        />
                        <SearchInput
                            className={styles.entriesFilter}
                            label={_ts('entries', 'entryGroupsFilterLabel')}
                            onChange={(value) => { handleFilterChange('lead_group_label', value); }}
                            showHintAndError={false}
                            disabled={pending}
                            value={filters.lead_group_label}
                            placeholder={_ts('entries', 'entryGroupsFilterPlaceholder')}
                        />
                    </>
                )}
            </div>
            <div className={styles.filtersGroup}>
                <h4 className={styles.heading}>
                    {_ts('entries', 'widgetsFiltersGroupTitle')}
                </h4>
                <List
                    data={filtersFromProps}
                    keySelector={filterKeySelector}
                    renderer={FrameworkFilter}
                    rendererParams={frameworkFilterRendererParams}
                />
            </div>
            <div className={styles.actionButtons}>
                {
                    !applyOnChange && (
                        <Button
                            className={styles.button}
                            onClick={handleApplyFilter}
                            disabled={pending || pristine}
                        >
                            {_ts('entries', 'applyFilterButtonLabel')}
                        </Button>
                    )
                }
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
    // eslint-disable-next-line react/no-unused-prop-types
    setEntryFilterOptions: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,
};

FilterEntriesForm.defaultProps = {
    pending: true,
    hideLeadFilters: false,
    className: undefined,
    filters: [],
    geoOptions: {},
    applyOnChange: false,
};

export default connect(mapStateToProps, mapDispatchToProps)(
    RequestClient(requestOptions)(FilterEntriesForm),
);
