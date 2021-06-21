import React, { useCallback, useMemo } from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    useForm,
    ObjectSchema,
    arrayCondition,
} from '@togglecorp/toggle-form';
import {
    TextInput,
    DateInput,
    Button,
    Container,
    MultiSelectInput,
    useBooleanState,
} from '@the-deep/deep-ui';
import {
    IoSearch,
    IoClose,
    IoChevronUpOutline,
    IoChevronDownOutline,
} from 'react-icons/io5';

import {
    useRequest,
} from '#utils/request';
import _ts from '#ts';
import { KeyValueElement, LeadOptions } from '#typings';
import NonFieldError from '#components/ui/NonFieldError';

import styles from './styles.scss';

export type FormType = {
    status?: string[];
    createdAt?: string;
    publishedOn?: string;
    assignee?: string[];
    search?: string;
};
type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        status: [arrayCondition],
        createdAt: [],
        publishedOn: [],
        assignee: [arrayCondition],
        search: [],
    }),
};

const initialValue: FormType = {};

const keySelector = (d: KeyValueElement): string => d.key;
const labelSelector = (d: KeyValueElement): string => d.value;

interface Props {
    className?: string;
    disabled?: boolean;
    projectId: number;
    onFilterApply?: (filters: FormType) => void;
}

function SourcesFilter(props: Props) {
    const {
        className,
        onFilterApply,
        projectId,
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
        if (!errored && isDefined(val) && onFilterApply) {
            onFilterApply(val);
        }
    }, [onErrorSet, validate, onFilterApply]);

    const handleClear = useCallback(() => {
        onValueSet({});
    }, [onValueSet]);

    const [
        showContent,,,,
        toggleContentVisibility,
    ] = useBooleanState(false);

    const disabled = disabledFromProps || pending;
    return (
        <Container
            className={_cs(styles.sourcesFilter, className)}
            headerClassName={styles.header}
            contentClassName={_cs(styles.content, showContent && styles.visible)}
            headingClassName={styles.heading}
            headerActions={(
                <div className={styles.filters}>
                    <NonFieldError error={error} />
                    <MultiSelectInput
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
                        name="publishedOn"
                        onChange={onValueChange}
                        value={value.publishedOn}
                        error={error?.fields?.publishedOn}
                        disabled={disabled}
                        label={_ts('sourcesFilter', 'originalDate')}
                        placeholder={_ts('sourcesFilter', 'originalDate')}
                    />
                    <DateInput
                        name="createdAt"
                        onChange={onValueChange}
                        value={value.createdAt}
                        error={error?.fields?.createdAt}
                        disabled={disabled}
                        label={_ts('sourcesFilter', 'addedOn')}
                        placeholder={_ts('sourcesFilter', 'addedOn')}
                    />
                    <MultiSelectInput
                        name="assignee"
                        onChange={onValueChange}
                        options={leadOptions?.assignee}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        value={value.assignee}
                        error={error?.fields?.assignee?.$internal}
                        label={_ts('sourcesFilter', 'assingee')}
                        placeholder={_ts('sourcesFilter', 'assingee')}
                    />
                    <TextInput
                        icons={<IoSearch />}
                        name="search"
                        onChange={onValueChange}
                        value={value.search}
                        error={error?.fields?.search}
                        disabled={disabled}
                        label={_ts('sourcesFilter', 'search')}
                        placeholder={_ts('sourcesFilter', 'search')}
                    />
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
                            {_ts('sourcesFilter', 'showAll')}
                        </Button>
                    </div>
                </div>
            )}
        >
            This is expanded // TODO: remove this when other filters are needed
        </Container>
    );
}

export default SourcesFilter;
