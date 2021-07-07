import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    DateInput,
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
import { KeyValueElement, LeadOptions, EmmEntity } from '#typings';
import NonFieldError from '#newComponents/ui/NonFieldError';

import styles from './styles.scss';

export type FormType = {
    status?: string[];
    createdAt?: string;
    publishedOn?: string;
    assignee?: string[];
    search?: string;
    exists?: string;
    priority?: string[];
    authoringOrganizationTypes?: string[];
    confidentiality?: string[];
    emmRiskFactors?: string[];
    emmKeywords?: string[];
    emmEntities?: string[];
};

type FormSchema = ObjectSchema<FormType>;
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

const initialValue: FormType = {};

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
    onFilterApply: (filters: FormType) => void;
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
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
    } = useForm(initialValue, schema);

    const handleApply = useCallback(() => {
        const { errored, error: err, value: val } = validate();
        onErrorSet(err);
        if (!errored && isDefined(val)) {
            onFilterApply(val);
        }
    }, [onErrorSet, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        onValueSet(initialValue);
        onFilterApply(initialValue);
    }, [onValueSet, onFilterApply]);

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
                    onChange={onValueChange}
                    options={leadOptions?.status}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.status}
                    error={error?.fields?.status?.$internal}
                    label={_ts('sourcesFilter', 'status')}
                    placeholder={_ts('sourcesFilter', 'status')}
                />
                <DateInput
                    className={styles.input}
                    name="publishedOn"
                    onChange={onValueChange}
                    value={value.publishedOn}
                    error={error?.fields?.publishedOn}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'originalDate')}
                    placeholder={_ts('sourcesFilter', 'originalDate')}
                />
                <DateInput
                    className={styles.input}
                    name="createdAt"
                    onChange={onValueChange}
                    value={value.createdAt}
                    error={error?.fields?.createdAt}
                    disabled={disabled}
                    label={_ts('sourcesFilter', 'addedOn')}
                    placeholder={_ts('sourcesFilter', 'addedOn')}
                />
                <MultiSelectInput
                    className={styles.input}
                    name="assignee"
                    onChange={onValueChange}
                    options={leadOptions?.assignee}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.assignee}
                    error={error?.fields?.assignee?.$internal}
                    label={_ts('sourcesFilter', 'assignee')}
                    placeholder={_ts('sourcesFilter', 'assignee')}
                />
                <TextInput
                    className={styles.input}
                    icons={<IoSearch />}
                    name="search"
                    onChange={onValueChange}
                    value={value.search}
                    error={error?.fields?.search}
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
                    onChange={onValueChange}
                    options={existsFilterOptions}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.exists}
                    error={error?.fields?.exists}
                    label={_ts('sourcesFilter', 'exists')}
                    placeholder={_ts('sourcesFilter', 'exists')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="priority"
                    onChange={onValueChange}
                    options={leadOptions?.priority}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.priority}
                    error={error?.fields?.priority?.$internal}
                    label={_ts('sourcesFilter', 'priority')}
                    placeholder={_ts('sourcesFilter', 'priority')}
                />
                <MultiSelectInput
                    className={_cs(
                        styles.input,
                        !showContent && styles.hidden,
                    )}
                    name="authoringOrganizationTypes"
                    onChange={onValueChange}
                    options={leadOptions?.organizationTypes}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    value={value.authoringOrganizationTypes}
                    error={error?.fields?.authoringOrganizationTypes?.$internal}
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
                        onChange={onValueChange}
                        options={leadOptions?.confidentiality}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={value.confidentiality}
                        error={error?.fields?.confidentiality?.$internal}
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
                            onChange={onValueChange}
                            options={leadOptions?.emmRiskFactors}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmRiskFactors}
                            error={error?.fields?.emmRiskFactors?.$internal}
                            label={_ts('sourcesFilter', 'emmRiskFactors')}
                            placeholder={_ts('sourcesFilter', 'emmRiskFactors')}
                        />
                        <MultiSelectInput
                            className={_cs(
                                styles.input,
                                !showContent && styles.hidden,
                            )}
                            name="emmKeywords"
                            onChange={onValueChange}
                            options={leadOptions?.emmKeywords}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmKeywords}
                            error={error?.fields?.emmKeywords?.$internal}
                            label={_ts('sourcesFilter', 'emmKeywords')}
                            placeholder={_ts('sourcesFilter', 'emmKeywords')}
                        />
                        <MultiSelectInput
                            className={_cs(
                                styles.input,
                                !showContent && styles.hidden,
                            )}
                            name="emmEntities"
                            onChange={onValueChange}
                            options={leadOptions?.emmEntities}
                            keySelector={emmKeySelector}
                            labelSelector={emmLabelSelector}
                            value={value.emmEntities}
                            error={error?.fields?.emmEntities?.$internal}
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
