import React, { useEffect, useMemo, useCallback } from 'react';
import {
    _cs,
    listToMap,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import {
    List,
    Button,
    DateRangeInput,
    MultiSelectInput,
    TextInput,
    SelectInput,
} from '@the-deep/deep-ui';
import {
    ObjectSchema,
    useForm,
} from '@togglecorp/toggle-form';

import { useRequest } from '#utils/request';
import { useModalState } from '#hooks/stateManagement';

import {
    EntryOptions,
    KeyValueElement,
    WidgetElement,
    ProjectDetails,
    FilterFields,
} from '#typings';
import _ts from '#ts';

import FrameworkFilter from './FrameworkFilter';
import { FaramValues } from '../';
import styles from './styles.scss';

const filterKeySelector = (d: FilterFields) => d.key;
const optionLabelSelector = (d: KeyValueElement) => d.value;
const optionKeySelector = (d: KeyValueElement) => d.key;

const verificationStatusOptions: KeyValueElement[] = [
    {
        key: 'true',
        value: _ts('pillarAnalysis', 'verifiedLabel'),
    },
    {
        key: 'false',
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

type FormType = FaramValues;

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
    }),
};

const initialValue: FormType = {
};

interface OwnProps {
    className?: string;
    filters?: FilterFields[];
    filtersValue?: FaramValues;
    regions?: ProjectDetails['regions'];
    onFiltersValueChange: (filters: FaramValues) => void;
    projectId: number;
    widgets?: WidgetElement<unknown>[];
    disabled?: boolean;
    selectedNgram?: string;
}

function EntriesFilterForm(props: OwnProps) {
    const {
        filters,
        projectId,
        className,
        widgets,
        filtersValue,
        regions,
        onFiltersValueChange,
        disabled,
        selectedNgram,
    } = props;

    const [
        allFiltersVisible,
        showAllFilters,
        hideAllFilters,
    ] = useModalState(false);

    const entryOptionsQueryParams = useMemo(() => ({
        project: projectId,
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

    const {
        pristine,
        value,
        setValue,
        setFieldValue,
    } = useForm(schema, initialValue);

    useEffect(() => {
        setValue(filtersValue ?? initialValue);
    }, [filtersValue, setValue]);

    useEffect(() => {
        setFieldValue(selectedNgram, 'search');
    }, [
        selectedNgram,
        setFieldValue,
    ]);

    const isFilterEmpty = useMemo(() => (
        doesObjectHaveNoData(value, [''])
    ), [value]);

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
            projectId,
            regions,
            value,
            onChange: setFieldValue,
            className: _cs(
                styles.filter,
                isMatrixFilter && styles.showFilter,
            ),
        });
    }, [regions, value, setFieldValue, projectId]);

    const handleClearFilters = useCallback(() => {
        onFiltersValueChange({});
    }, [onFiltersValueChange]);

    const pending = entryOptionsPending;

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onFiltersValueChange(value);
    }, [onFiltersValueChange, value]);

    return (
        <form
            className={_cs(
                className,
                styles.entriesFilterForm,
                allFiltersVisible && styles.showFilters,
            )}
            onSubmit={handleSubmit}
        >
            <TextInput
                className={_cs(styles.filter, styles.showFilter)}
                name="search"
                value={value?.search as (string | undefined)}
                onChange={setFieldValue}
                label="Search"
            />
            <MultiSelectInput
                className={styles.filter}
                name="created_by"
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                value={value?.created_by as (string[] | undefined)}
                onChange={setFieldValue}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'createdByFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'createdByPlaceholder')}
            />
            <DateRangeInput
                name="created_at"
                className={styles.filter}
                label={_ts('pillarAnalysis', 'createdAtFilterLabel')}
                value={value?.created_at as (
                    { startDate: string; endDate: string } | undefined)
                }
                onChange={setFieldValue}
            />
            <MultiSelectInput
                className={styles.filter}
                name="comment_assignee"
                value={value?.comment_assignee as (string[] | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'commentAssignedToFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'createdByPlaceholder')}
            />
            <MultiSelectInput
                className={styles.filter}
                name="comment_created_by"
                value={value?.comment_created_by as (string[] | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={entryOptions?.createdBy}
                label={_ts('pillarAnalysis', 'commentCreatedByFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'commentCreatedByPlaceholder')}
            />
            <SelectInput
                className={styles.filter}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                value={value?.comment_status as (string | undefined)}
                onChange={setFieldValue}
                name="comment_status"
                options={commentStatusOptions}
                label={_ts('pillarAnalysis', 'commentStatusOptionsFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'commentStatusPlaceholder')}
            />
            <SelectInput
                className={styles.filter}
                name="verified"
                value={value?.verified as (string | undefined)}
                onChange={setFieldValue}
                keySelector={optionKeySelector}
                labelSelector={optionLabelSelector}
                options={verificationStatusOptions}
                label={_ts('pillarAnalysis', 'verificationStatusOptionsFilterLabel')}
                placeholder={_ts('pillarAnalysis', 'verificationStatusPlaceholder')}
            />
            <MultiSelectInput
                className={styles.filter}
                name="entry_type"
                value={value?.entry_type as (string[] | undefined)}
                onChange={setFieldValue}
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
        </form>
    );
}

export default EntriesFilterForm;
