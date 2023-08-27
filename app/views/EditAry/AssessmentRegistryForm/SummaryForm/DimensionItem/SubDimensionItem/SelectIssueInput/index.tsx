import React, { useCallback, useState, useMemo } from 'react';
import { SearchSelectInput, TextInput } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    useFormObject,
    useFormArray,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString, isDefined, isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    PartialFormType,
    SummaryIssueType,
    SubDimensionIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import {
    AssessmentRegistrySectorTypeEnum,
    AssessmentRegistrySummarySubDimensionTypeEnum,
    SummarySubDimensionIssueSearchQuery,
    SummarySubDimensionIssueSearchQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const SUMMARY_SUB_DIMENSION_ISSUE_SEARCH = gql`
    query SummarySubDimensionIssueSearch(
        $subDimension: AssessmentRegistrySummarySubDimensionTypeEnum,
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subDimension: $subDimension,
            search: $search,
            pageSize: $pageSize,
            page: $page,
        ) {
            page
            results {
                id
                label
            }
            totalCount
        }
    }
`;

interface Props {
    name: string;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    order: number;
    disabled?: boolean;
    mainIndex?: number;
    placeholder?: string;
    value?: SubDimensionIssueType;
    error?: Error<PartialFormType['summarySubDimensionIssue']>;

    setDimensionIssueToClientIdMap: React.Dispatch<React.SetStateAction<
    Record<string, string>>>;
    dimensionIssuesOptions?: SummaryIssueType[] | null;
    setDimensionIssuesOptions: React.Dispatch<React.SetStateAction<
    SummaryIssueType[]
    | undefined
    | null
    >>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;

    sector: AssessmentRegistrySectorTypeEnum;
}

const keySelector = (d: SummaryIssueType) => d.id;
const labelSelector = (d: SummaryIssueType) => d.label;

function SelectIssueInput(props: Props) {
    const {
        subDimension,
        name,
        value,
        mainIndex,
        order,
        setDimensionIssueToClientIdMap,
        placeholder,
        dimensionIssuesOptions: options,
        setDimensionIssuesOptions: setOptions,
        onChange,
        sector,
        error,
        disabled,
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        setValue: setSubDimensionIssue,
        removeValue,
    } = useFormArray<
        'summarySubDimensionIssue',
        SubDimensionIssueType
    >('summarySubDimensionIssue', onChange);

    const onFieldChange = useFormObject(mainIndex, setSubDimensionIssue, {
        clientId: randomString(),
        order,
        sector,
    });

    const handleIssueChange = useCallback((issueId: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                summaryIssue: issueId,
                sector,
            };
            setDimensionIssueToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubDimensionIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubDimensionIssue');
        } else if (!issueId && isDefined(mainIndex)) {
            removeValue(mainIndex);
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        name,
        order,
        value,
        sector,
        removeValue,
        mainIndex,
        onFieldChange,
        setDimensionIssueToClientIdMap,
        onChange,
    ]);

    const handleTextChange = useCallback((newText: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                text: newText,
                sector,
            };
            setDimensionIssueToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubDimensionIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubDimensionIssue');
        } else {
            onFieldChange(newText, 'text');
        }
    }, [
        name,
        order,
        value,
        sector,
        onFieldChange,
        setDimensionIssueToClientIdMap,
        onChange,
    ]);

    const variables = useMemo(
        (): SummarySubDimensionIssueSearchQueryVariables => ({
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
            search: debouncedSearchText,
            page: 1,
            pageSize: 10,
        }), [
            debouncedSearchText,
            subDimension,
        ],
    );

    const {
        loading,
        data,
        fetchMore,
    } = useQuery<
        SummarySubDimensionIssueSearchQuery,
        SummarySubDimensionIssueSearchQueryVariables
    >(
        SUMMARY_SUB_DIMENSION_ISSUE_SEARCH,
        {
            skip: !opened,
            variables,
        },
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.assessmentRegSummaryIssues?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.assessmentRegSummaryIssues) {
                    return previousResult;
                }

                const oldIssues = previousResult.assessmentRegSummaryIssues;
                const newIssues = fetchMoreResult?.assessmentRegSummaryIssues;

                if (!newIssues) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    assessmentRegSummaryIssues: {
                        ...newIssues,
                        results: [
                            ...(oldIssues.results ?? []),
                            ...(newIssues.results ?? []),
                        ],
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.assessmentRegSummaryIssues?.page,
    ]);

    const getError = useCallback(
        (clientId?: string) => {
            if (!clientId) {
                return undefined;
            }
            return getErrorObject(getErrorObject(error)?.[clientId]);
        }, [error],
    );

    return (
        <div className={styles.input}>
            <SearchSelectInput
                placeholder={placeholder}
                name="summaryIssue"
                value={value?.summaryIssue}
                onChange={handleIssueChange}
                keySelector={keySelector}
                labelSelector={labelSelector}
                options={options}
                onOptionsChange={setOptions}
                onSearchValueChange={setSearchText}
                searchOptions={data?.assessmentRegSummaryIssues?.results}
                totalOptionsCount={data?.assessmentRegSummaryIssues?.totalCount ?? 0}
                optionsPending={loading}
                onShowDropdownChange={setOpened}
                handleShowMoreClick={handleShowMoreClick}
                error={getError(value?.clientId)?.summaryIssue}
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleTextChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.summaryIssue)}
                error={getError(value?.clientId)?.text}
            />
        </div>

    );
}

export default SelectIssueInput;
