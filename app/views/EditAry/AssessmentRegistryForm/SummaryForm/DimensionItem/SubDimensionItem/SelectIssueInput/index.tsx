import React, { useCallback, useState, useMemo } from 'react';
import { SearchSelectInput, TextInput } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    useFormObject,
    useFormArray,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { randomString, isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    PartialFormType,
    SummaryIssueType,
    SubDimensionIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import {
    AssessmentRegistrySummaryFocusDimensionTypeEnum,
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

    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
    dimension: AssessmentRegistrySummaryFocusDimensionTypeEnum;
}

const keySelector = (d: SummaryIssueType) => d.id;
const labelSelector = (d: SummaryIssueType) => d.label;

function SelectIssueInput(props: Props) {
    const {
        dimension,
        subDimension,
        name,
        value,
        mainIndex,
        order,
        setIssueItemToClientIdMap,
        placeholder,
        issuesOptions: options,
        setIssuesOptions: setOptions,
        onChange,
        error,
        disabled,
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        setValue: setSubDimensionIssue,
    } = useFormArray<
        'summarySubDimensionIssue',
        SubDimensionIssueType
    >('summarySubDimensionIssue', onChange);

    const onFieldChange = useFormObject(mainIndex, setSubDimensionIssue, {
        clientId: randomString(),
        order,
        focus: dimension,
    });

    const handleIssueChange = useCallback((issueId: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                summaryIssue: issueId,
            };
            setIssueItemToClientIdMap((oldVal) => ({
                ...oldVal,
                [name]: newVal.clientId,
            }));
            onChange((oldVal: SubDimensionIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        name,
        order,
        value,
        dimension,
        onFieldChange,
        setIssueItemToClientIdMap,
        onChange,
    ]);

    const handleTextChange = useCallback((newText: string | undefined) => {
        if (!value) {
            const newVal = {
                clientId: randomString(),
                order,
                text: newText,
            };
            setIssueItemToClientIdMap((oldVal) => ({
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
        onFieldChange,
        setIssueItemToClientIdMap,
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
