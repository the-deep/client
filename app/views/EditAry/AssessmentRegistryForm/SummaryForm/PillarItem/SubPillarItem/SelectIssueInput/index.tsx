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

import {
    PartialFormType,
    SummaryIssueType,
    SubPillarIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    SummaryIssueSearchQuery,
    SummaryIssueSearchQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const SUMMARY_ISSUE_SEARCH = gql`
    query SummaryIssueSearch(
        $subPillar: AssessmentRegistrySummarySubPillarTypeEnum,
        $subDimension: AssessmentRegistrySummarySubDimensionTypeEnum,
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subPillar: $subPillar,
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
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    order: number;
    disabled?: boolean;
    mainIndex?: number;
    placeholder?: string;
    value?: SubPillarIssueType;
    error?: Error<PartialFormType['summarySubPillarIssue']>;

    issuesOptions?: SummaryIssueType[] | null;
    setIssuesOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
}

const keySelector = (d: SummaryIssueType) => d.id;
const labelSelector = (d: SummaryIssueType) => d.label;

function SelectIssueInput(props: Props) {
    const {
        subPillar,
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
        setValue: setSubPillarIssue,
        removeValue,
    } = useFormArray<
        'summarySubPillarIssue',
        SubPillarIssueType
    >('summarySubPillarIssue', onChange);

    const onFieldChange = useFormObject(mainIndex, setSubPillarIssue, {
        clientId: randomString(),
        order,
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
            onChange((oldVal: SubPillarIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
        } else if (!issueId && isDefined(mainIndex)) {
            removeValue(mainIndex);
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        name,
        order,
        value,
        onFieldChange,
        removeValue,
        mainIndex,
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
            onChange((oldVal: SubPillarIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
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
        (): SummaryIssueSearchQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
            search: debouncedSearchText,
            page: 1,
            pageSize: 10,
        }), [
            debouncedSearchText,
            subPillar,
            subDimension,
        ],
    );

    const {
        loading,
        data,
        fetchMore,
    } = useQuery<SummaryIssueSearchQuery, SummaryIssueSearchQueryVariables>(
        SUMMARY_ISSUE_SEARCH,
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
