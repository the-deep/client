import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    Button,
    MultiSelectInput as NewMultiSelectInput,
    SelectInput as NewSelectInput,
} from '@the-deep/deep-ui';
import Faram, { FaramInputElement } from '@togglecorp/faram';

import List from '#rsu/../v2/View/List';
import { useRequest } from '#utils/request';
import DateFilter from '#rsci/DateFilter';
import { useModalState } from '#hooks/stateManagement';

import {
    GeoOptions,
    EntryOptions,
    KeyValueElement,
    BooleanKeyValueElement,
    WidgetElement,
    ProjectDetails,
    FilterFields,
} from '#typings';
import _ts from '#ts';

import FrameworkFilter from './FrameworkFilter';
import { FaramValues } from '../';
import styles from './styles.scss';

const MultiSelectInput = FaramInputElement(NewMultiSelectInput);
const SelectInput = FaramInputElement(NewSelectInput);

const filterKeySelector = (d: FilterFields) => d.key;
const optionLabelSelector = (d: KeyValueElement) => d.value;
const optionKeySelector = (d: KeyValueElement) => d.key;

const verificationStatusOptions: BooleanKeyValueElement[] = [
    {
        key: true,
        value: _ts('pillarAnalysis', 'verifiedLabel'),
    },
    {
        key: false,
        value: _ts('pillarAnalysis', 'unverifiedLabel'),
    },
];

const entryTypeOptions: KeyValueElement[] = [
    {
        key: 'excerpt',
        value: _ts('pillarAnalysis', 'excerpt'),
    },
    {
        key: 'image',
        value: _ts('pillarAnalysis', 'image'),
    },
    {
        key: 'dataSeries',
        value: _ts('pillarAnalysis', 'dataSeries'),
    },
];
const commentStatusOptions: KeyValueElement[] = [
    {
        key: 'resolved',
        value: _ts('pillarAnalysis', 'resolvedCommentLabel'),
    },
    {
        key: 'unresolved',
        value: _ts('pillarAnalysis', 'unresolvedCommentLabel'),
    },
];

interface OwnProps {
    className?: string;
    filters?: FilterFields[];
    filtersValue?: FaramValues;
    geoOptions?: GeoOptions;
    regions?: ProjectDetails['regions'];
    onFiltersValueChange: (filters: FaramValues) => void;
    projectId: number;
    widgets?: WidgetElement<unknown>[];
    disabled?: boolean;
}

function EntriesFilterForm(props: OwnProps) {
    const {
        filters,
        projectId,
        className,
        widgets,
        filtersValue,
        geoOptions,
        regions,
        onFiltersValueChange,
        disabled,
    } = props;

    const [faramValues, setFaramValues] = useState(filtersValue);
    const [faramErrors, setFaramErrors] = useState({});

    useEffect(() => {
        setFaramValues(filtersValue);
    }, [filtersValue]);
    const [
        allFiltersVisible,
        showAllFilters,
        hideAllFilters,
    ] = useModalState(false);
    const [pristine, setPristine] = useState(true);

    const entryOptionsQueryParams = useMemo(() => ({
        projects: [projectId],
    }), [projectId]);

    const {
        pending: entryOptionsPending,
        response: entryOptions,
    } = useRequest<EntryOptions>({
        url: 'server://entry-options/',
        query: entryOptionsQueryParams,
        method: 'GET',
        failureHeader: _ts('pillarAnalysis', 'entryOptions'),
    });

    const schema = useMemo(() => ({
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
            ...listToMap(filters, v => v.key, () => []),
        },
    }), [filters]);

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(faramValues, [''])
    ), [faramValues]);

    const isClearDisabled = isFilterEmpty && pristine;

    const filteredFrameworkFilters = useMemo(() => {
        const widgetsMap = listToMap(widgets, d => d.key, d => d.widgetId);
        const filtersWithId = filters?.map(f => ({
            ...f,
            widgetId: widgetsMap[f.widgetKey],
        }));
        return filtersWithId ?? [];
    }, [widgets, filters]);

    const frameworkFilterRendererParams = useCallback((key, data) => {
        const isMatrixFilter = data.widgetId === 'matrix1dWidget'
            || data.widgetId === 'matrix2dWidget';

        return ({
            filterKey: key,
            title: data.title,
            filter: data.properties,
            regions,
            geoOptions,
            className: _cs(
                styles.filter,
                isMatrixFilter && styles.showFilter,
            ),
        });
    }, [regions, geoOptions]);

    const handleFaramChange = useCallback((newValues) => {
        setFaramValues(newValues);
        setPristine(false);
    }, []);

    const handleFaramValidationSuccess = useCallback((_, finalValues) => {
        onFiltersValueChange(finalValues);
        setPristine(true);
    }, [onFiltersValueChange]);

    const handleClearFilters = useCallback(() => {
        setFaramValues({});
        onFiltersValueChange({});
        setPristine(true);
    }, [onFiltersValueChange]);

    const pending = entryOptionsPending;

    return (
        <Faram
            schema={schema}
            value={faramValues}
            error={faramErrors}
            disabled={pending || disabled}
            onValidationSuccess={handleFaramValidationSuccess}
            onValidationFailure={setFaramErrors}
            onChange={handleFaramChange}
            className={_cs(
                className,
                styles.entriesFilterForm,
                allFiltersVisible && styles.showFilters,
            )}
        >
            <MultiSelectInput
                className={styles.filter}
                name="created_by"
                faramElementName="created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'createdByFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'createdByPlaceholder')}
            />
            <DateFilter
                className={styles.filter}
                faramElementName="created_at"
                label={_ts('pillarAnalysis', 'createdAtFilterLabel')}
                placeholder={_ts('leads', 'placeholderAnytime')}
                showHintAndError={false}
            />
            <MultiSelectInput
                className={styles.filter}
                name="comment_assignee"
                faramElementName="comment_assignee"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'commentAssignedToFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'createdByPlaceholder')}
            />
            <MultiSelectInput
                className={styles.filter}
                name="comment_created_by"
                faramElementName="comment_created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'commentCreatedByFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'commentCreatedByPlaceholder')}
            />
            <SelectInput
                className={styles.filter}
                faramElementName="comment_status"
                name="comment_status"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={commentStatusOptions}
                label={_ts('pillarAnalysis', 'commentStatusOptionsFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'commentStatusPlaceholder')}
            />
            <SelectInput
                className={styles.filter}
                name="verified"
                faramElementName="verified"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={verificationStatusOptions}
                label={_ts('pillarAnalysis', 'verificationStatusOptionsFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'verificationStatusPlaceholder')}
            />
            <MultiSelectInput
                className={styles.filter}
                name="entry_type"
                faramElementName="entry_type"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryTypeOptions}
                label={_ts('pillarAnalysis', 'entryTypeFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'entryTypePlaceholder')}
            />
            { filteredFrameworkFilters.length > 0 && (
                <List
                    data={filteredFrameworkFilters}
                    keySelector={filterKeySelector}
                    renderer={FrameworkFilter}
                    rendererParams={frameworkFilterRendererParams}
                />
            )}
            <Button
                name={undefined}
                className={styles.button}
                disabled={pristine || pending || disabled}
                type="submit"
            >
                {_ts('pillarAnalysis', 'filterApplyFilter')}
            </Button>
            <Button
                name={undefined}
                className={styles.button}
                disabled={isClearDisabled || pending || disabled}
                onClick={handleClearFilters}
                variant="tertiary"
            >
                {_ts('pillarAnalysis', 'filterClearFilter')}
            </Button>
            <Button
                name={undefined}
                className={styles.button}
                onClick={allFiltersVisible ? hideAllFilters : showAllFilters}
                variant="tertiary"
                disabled={disabled}
            >
                {allFiltersVisible
                    ? _ts('pillarAnalysis', 'hideFiltersLabel')
                    : _ts('pillarAnalysis', 'ShowFiltersLabel')
                }
            </Button>
        </Faram>
    );
}

export default EntriesFilterForm;
