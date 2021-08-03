import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    getErrorString,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    DateRangeInput,
    SelectInput,
    MultiSelectInput,
    useBooleanState,
    Header,
    Button,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
    IoApps,
} from 'react-icons/io5';

import {
    useRequest,
} from '#utils/request';
import _ts from '#ts';
import { KeyValueElement, LeadOptions, EmmEntity } from '#types';
import NonFieldError from '#components/NonFieldError';
import { FilterFormType } from '../utils';

import styles from './styles.css';

// FIXME: Created at and published on are date ranges and not date inputs

type FormSchema = ObjectSchema<FilterFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        status: [],
        createdAt: [],
        publishedOn: [],
        assignee: [],
        search: [],
        exists: [],
        priority: [],
        authoringOrganizationTypes: [],
        confidentiality: [],
        emmRiskFactors: [],
        emmKeywords: [],
        emmEntities: [],
    }),
};

const initialValue: FilterFormType = {};

const keySelector = (d: KeyValueElement): string => d.key;
const labelSelector = (d: KeyValueElement): string => d.value;
const emmKeySelector = (d: EmmEntity): string => d.key.toString();
const emmLabelSelector = (d: EmmEntity): string => `${d.label} ${d.totalCount}`;

const existsFilterOptions: KeyValueElement[] = [
    {
        key: 'assessment_exists',
        value: _ts('sourcesFilter', 'assessmentExistsOptionLabel'),
    },
    {
        key: 'assessment_does_not_exist',
        value: _ts('sourcesFilter', 'assessmentDoesNotExistsOptionLabel'),
    },
];

interface Props {
    className?: string;
    disabled?: boolean;
    projectId: number;
    filterOnlyUnprotected?: boolean;
    onFilterApply: (filters: FilterFormType) => void;
}

function SourcesFilter(props: Props) {
    const {
        className,
        onFilterApply,
        projectId,
        filterOnlyUnprotected,
        disabled: disabledFromProps,
    } = props;

    const queryOptions = useMemo(() => ({
        projects: [projectId],
    }), [projectId]);

    const {
        pending,
        response: leadOptions,
    } = useRequest<LeadOptions>({
        skip: isNotDefined(projectId),
        url: 'server://lead-options/',
        method: 'GET',
        query: queryOptions,
        failureHeader: _ts('sourcesFilter', 'title'),
    });

    const {
        pristine,
        value,
        error: riskyError,
        setFieldValue,
        validate,
        setError,
        setValue,
    } = useForm(schema, initialValue);

    const error = getErrorObject(riskyError);

    const handleApply = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        setError(err);
        if (!errored && isDefined(val)) {
            onFilterApply(val);
        }
    }, [setError, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        setValue(initialValue);
        onFilterApply(initialValue);
    }, [setValue, onFilterApply]);

    const [
        showContent,,,,
        toggleContentVisibility,
    ] = useBooleanState(false);

    const disabled = disabledFromProps || pending;
    return (
        <div className={_cs(styles.sourcesFilter, className)}>
            <Header
                className={styles.header}
                heading={_ts('sourcesFilter', 'title')}
                headingSectionClassName={styles.heading}
                headingSize="medium"
                actionsContainerClassName={styles.actions}
                actions={(
                    <Button
                        name="switch"
                        variant="action"
                    >
                        <IoApps />
                    </Button>
                )}
            />
            <NonFieldError error={error} />
            <div className={styles.content}>
                <MultiSelectInput
                    className={styles.input}
                    name="status"
                    onChange={setFieldValue}
                    options={leadOptions?.status}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.status}
                    error={getErrorString(error?.status)}
                    label={_ts('sourcesFilter', 'status')}
                    placeholder={_ts('sourcesFilter', 'status')}
                />
                <DateRangeInput
                    className={styles.input}
                    name="publishedOn"
                    onChange={setFieldValue}
                    value={value.publishedOn}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'originalDate')}
                />
                <DateRangeInput
                    className={styles.input}
                    name="createdAt"
                    onChange={setFieldValue}
                    value={value.createdAt}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'addedOn')}
                />
                <MultiSelectInput
                    className={styles.input}
                    name="assignee"
                    onChange={setFieldValue}
                    options={leadOptions?.assignee}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.assignee}
                    error={getErrorString(error?.assignee)}
                    label={_ts('sourcesFilter', 'assignee')}
                    placeholder={_ts('sourcesFilter', 'assignee')}
                />
                <TextInput
                    className={styles.input}
                    icons={<IoSearch />}
                    name="search"
                    onChange={setFieldValue}
                    value={value.search}
                    error={error?.search}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'search')}
                    placeholder={_ts('sourcesFilter', 'search')}
                />
                <SelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="exists"
                    onChange={setFieldValue}
                    options={existsFilterOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.exists}
                    error={error?.exists}
                    label={_ts('sourcesFilter', 'exists')}
                    placeholder={_ts('sourcesFilter', 'exists')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="priority"
                    onChange={setFieldValue}
                    options={leadOptions?.priority}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.priority}
                    error={getErrorString(error?.priority)}
                    label={_ts('sourcesFilter', 'priority')}
                    placeholder={_ts('sourcesFilter', 'priority')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="authoringOrganizationTypes"
                    onChange={setFieldValue}
                    options={leadOptions?.organizationTypes}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.authoringOrganizationTypes}
                    error={getErrorString(error?.authoringOrganizationTypes)}
                    label={_ts('sourcesFilter', 'authoringOrganizationTypes')}
                    placeholder={_ts('sourcesFilter', 'authoringOrganizationTypes')}
                />
                {!filterOnlyUnprotected && (
                    <MultiSelectInput
                        className={_cs(
                            styles.input,
                            !showContent && styles.hidden,
                        )}
                        name="confidentiality"
                        onChange={setFieldValue}
                        options={leadOptions?.confidentiality}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={value.confidentiality}
                        error={getErrorString(error?.confidentiality)}
                        label={_ts('sourcesFilter', 'confidentiality')}
                        placeholder={_ts('sourcesFilter', 'confidentiality')}
                    />
                )}
                {leadOptions?.hasEmmLeads && (
                    <>
                        <MultiSelectInput
                            className={_cs(
                                styles.input,
                                !showContent && styles.hidden,
                            )}
                            name="emmRiskFactors"
                            onChange={setFieldValue}
                            options={leadOptions?.emmRiskFactors}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmRiskFactors}
                            error={getErrorString(error?.emmRiskFactors)}
                            label={_ts('sourcesFilter', 'emmRiskFactors')}
                            placeholder={_ts('sourcesFilter', 'emmRiskFactors')}
                        />
                        <MultiSelectInput
                            className={_cs(
                                styles.input,
                                !showContent && styles.hidden,
                            )}
                            name="emmKeywords"
                            onChange={setFieldValue}
                            options={leadOptions?.emmKeywords}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmKeywords}
                            error={getErrorString(error?.emmKeywords)}
                            label={_ts('sourcesFilter', 'emmKeywords')}
                            placeholder={_ts('sourcesFilter', 'emmKeywords')}
                        />
                        <MultiSelectInput
                            className={_cs(
                                styles.input,
                                !showContent && styles.hidden,
                            )}
                            name="emmEntities"
                            onChange={setFieldValue}
                            options={leadOptions?.emmEntities}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmEntities}
                            error={getErrorString(error?.emmEntities)}
                            label={_ts('sourcesFilter', 'emmEntities')}
                            placeholder={_ts('sourcesFilter', 'emmEntities')}
                        />
                    </>
                )}
                <div className={styles.actions}>
                    <Button
                        className={styles.button}
                        disabled={disabled || pristine}
                        name="sourcesFilterSubmit"
                        variant="action"
                        onClick={handleApply}
                    >
                        {_ts('sourcesFilter', 'apply')}
                    </Button>
                    <Button
                        className={styles.button}
                        disabled={disabled || pristine}
                        name="clearFilter"
                        variant="action"
                        actions={<IoClose />}
                        onClick={handleClear}
                    >
                        {_ts('sourcesFilter', 'clearAll')}
                    </Button>
                    <Button
                        className={styles.button}
                        name="showAll"
                        variant="action"
                        actions={showContent ? (
                            <IoChevronUpOutline />
                        ) : (
                            <IoChevronDownOutline />
                        )}
                        onClick={toggleContentVisibility}
                    >
                        {_ts('sourcesFilter', showContent ? 'hide' : 'showAll')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SourcesFilter;
