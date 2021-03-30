import React, { useState, useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    Button,
} from '@the-deep/deep-ui';
import Faram from '@togglecorp/faram';

import List from '#rsu/../v2/View/List';
import useRequest from '#utils/request';
import DateFilter from '#rsci/DateFilter';
import SelectInput from '#rsci/SelectInput';
import MultiSelectInput from '#rsci/MultiSelectInput';
import { notifyOnFailure } from '#utils/requestNotify';
import FrameworkFilter from '#views/Export/LeadsSelection/FilterForm/FrameworkFilter';
import { useModalState } from '#hooks/stateManagement';

import {
    EntryOptions,
    KeyValueElement,
    BooleanKeyValueElement,
    WidgetElement,
    FilterFields,
} from '#typings';
import _ts from '#ts';

import styles from './styles.scss';

const filterKeySelector = (d: FilterFields) => d.key;
const optionLabelSelector = (d: KeyValueElement) => d.value;
const optionKeySelector = (d: KeyValueElement) => d.key;

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

interface OwnProps {
    className?: string;
    filters?: FilterFields[];
    // FIXME: Write better schema
    filtersValue?: unknown;
    geoOptions?: unknown;
    onFiltersValueChange: (filters: unknown) => void;
    projectId: number;
    widgets?: WidgetElement<unknown>[];
}

function EntriesFilterForm(props: OwnProps) {
    const {
        filters,
        projectId,
        className,
        widgets,
        filtersValue,
        geoOptions,
        onFiltersValueChange,
    } = props;

    const [faramValues, setFaramValues] = useState(filtersValue);
    const [faramErrors, setFaramErrors] = useState({});
    const [
        allFiltersVisible,
        showAllFilters,
        hideAllFilters,
    ] = useModalState(false);
    const [pristine, setPristine] = useState(true);

    const entryOptionsQueryParams = useMemo(() => ({
        projects: [projectId],
    }), [projectId]);

    const [
        entryOptionsPending,
        entryOptions,
    ] = useRequest<EntryOptions>({
        url: 'server://entry-options/',
        query: entryOptionsQueryParams,
        autoTrigger: true,
        method: 'GET',
        onFailure: (_, errorBody) => {
            notifyOnFailure(_ts('export', 'entryOptions'))({ error: errorBody });
        },
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
            ...listToMap(filters, v => v.key, v => []),
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
            className: _cs(
                styles.filter,
                isMatrixFilter && styles.showFilter,
            ),
        });
    }, []);

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
            disabled={pending}
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
                faramElementName="created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('entries', 'createdByFilterLabel')}
                placeholder={_ts('entries', 'createdByPlaceholder')}
                showHintAndError={false}
            />
            <DateFilter
                className={styles.filter}
                faramElementName="created_at"
                label={_ts('entries', 'createdAtFilterLabel')}
                placeholder={_ts('leads', 'placeholderAnytime')}
                showHintAndError={false}
            />
            <MultiSelectInput
                className={styles.filter}
                faramElementName="comment_assignee"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('entries', 'commentAssignedToFilterLabel')}
                placeholder={_ts('entries', 'createdByPlaceholder')}
                showHintAndError={false}
            />
            <MultiSelectInput
                className={styles.filter}
                faramElementName="comment_created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('entries', 'commentCreatedByFilterLabel')}
                showHintAndError={false}
                placeholder={_ts('entries', 'commentCreatedByPlaceholder')}
            />
            <SelectInput
                className={styles.filter}
                faramElementName="comment_status"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={commentStatusOptions}
                label={_ts('entries', 'commentStatusOptionsFilterLabel')}
                placeholder={_ts('entries', 'commentStatusPlaceholder')}
                showHintAndError={false}
            />
            <SelectInput
                className={styles.filter}
                faramElementName="verified"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={verificationStatusOptions}
                label={_ts('entries', 'verificationStatusOptionsFilterLabel')}
                showHintAndError={false}
                placeholder={_ts('entries', 'verificationStatusPlaceholder')}
            />
            <MultiSelectInput
                className={styles.filter}
                faramElementName="entry_type"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryTypeOptions}
                label={_ts('entries', 'entryTypeFilterLabel')}
                showHintAndError={false}
                placeholder={_ts('entries', 'entryTypePlaceholder')}
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
                className={styles.button}
                disabled={pristine || pending}
                type="submit"
            >
                {_ts('leads', 'filterApplyFilter')}
            </Button>
            <Button
                className={styles.button}
                disabled={isClearDisabled || pending}
                onClick={handleClearFilters}
                variant="tertiary"
            >
                {_ts('leads', 'filterClearFilter')}
            </Button>
            <Button
                className={styles.button}
                onClick={allFiltersVisible ? hideAllFilters : showAllFilters}
                variant="tertiary"
            >
                {allFiltersVisible ? 'Hide filters' : 'Show all filters'}
            </Button>
        </Faram>
    );
}

export default EntriesFilterForm;
