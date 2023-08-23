import React, { useCallback, useState, useMemo } from 'react';
import { SearchSelectInput, TextInput } from '@the-deep/deep-ui';
import { isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import { SummaryIssueType } from '#views/EditAry/AssessmentRegistryForm/formSchema';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    AssessmentRegistrySummarySubPillarTypeEnum,
    SummaryIssueSearchQuery,
    SummaryIssueSearchQueryVariables,
} from '#generated/types';

import styles from './styles.css';

const SUMMARY_ISSUE_SEARCH = gql`
    query SummaryIssueSearch(
        $subPillar: AssessmentRegistrySummarySubPillarTypeEnum,
        $search: String,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subPillar: $subPillar,
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
    disabled?: boolean;
    placeholder?: string;
    options?: SummaryIssueType[] | null;
    setOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    value?: {
        summaryIssue?: string;
        text?: string;
        order?: number;
    };
    onChangeIssue: (name: string, value: string) => void;
}

const keySelector = (d: SummaryIssueType) => d.id;
const labelSelector = (d: SummaryIssueType) => d.label;

function SelectIssueInput(props: Props) {
    const {
        subPillar,
        name,
        value,
        placeholder,
        options,
        setOptions,
        onChangeIssue,
        disabled,
    } = props;
    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(
        (): SummaryIssueSearchQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            search: debouncedSearchText,
            page: 1,
            pageSize: 10,
        }), [
            debouncedSearchText,
            subPillar,
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
    const handleInputChange = useCallback(
        (fieldValue, fieldName: string) => {
            onChangeIssue(fieldName, fieldValue);
        }, [onChangeIssue],
    );

    return (
        <div className={styles.input}>
            <SearchSelectInput
                placeholder={placeholder}
                name={name}
                value={value?.summaryIssue}
                onChange={handleInputChange}
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
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleInputChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.summaryIssue)}
            />
        </div>

    );
}

export default SelectIssueInput;
