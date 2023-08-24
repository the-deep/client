import React, { useCallback, useState, useMemo } from 'react';
import { SearchSelectInput, TextInput } from '@the-deep/deep-ui';
import {
    EntriesAsList,
    useFormObject,
    useFormArray,
} from '@togglecorp/toggle-form';
import { randomString, isNotDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';

import {
    PartialFormType,
    SummaryIssueType,
    SubPillarIssueType,
} from '#views/EditAry/AssessmentRegistryForm/formSchema';
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
    order: number;
    disabled?: boolean;
    mainIndex?: number;
    placeholder?: string;
    value?: SubPillarIssueType;

    issueOptions?: SummaryIssueType[] | null;
    setIssueOptions: React.Dispatch<React.SetStateAction<SummaryIssueType[] |undefined | null>>;
    setIssueItemToClientIdMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    onChange: (...entries: EntriesAsList<PartialFormType>) => void;
}

const keySelector = (d: SummaryIssueType) => d.id;
const labelSelector = (d: SummaryIssueType) => d.label;

function SelectIssueInput(props: Props) {
    const {
        subPillar,
        name,
        value,
        mainIndex,
        order,
        setIssueItemToClientIdMap,
        placeholder,
        issueOptions: options,
        setIssueOptions: setOptions,
        onChange,
        disabled,
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        setValue: setSubPillarIssue,
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
        } else {
            onFieldChange(issueId, 'summaryIssue');
        }
    }, [
        value,
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
            onChange((oldVal: SubPillarIssueType[] | undefined) => ([
                ...(oldVal ?? []),
                newVal,
            ]), 'summarySubPillarIssue');
        } else {
            onFieldChange(newText, 'text');
        }
    }, [
        value,
        onFieldChange,
        setIssueItemToClientIdMap,
        onChange,
    ]);

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
            />
            <TextInput
                placeholder="Drop text here"
                name="text"
                onChange={handleTextChange}
                value={value?.text}
                variant="general"
                disabled={disabled || isNotDefined(value?.summaryIssue)}
            />
        </div>

    );
}

export default SelectIssueInput;
