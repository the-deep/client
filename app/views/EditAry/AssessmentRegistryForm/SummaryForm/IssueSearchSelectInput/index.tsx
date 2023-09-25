import React, {
    useMemo,
    useState,
    useCallback,
} from 'react';

import {
    Footer,
    ListView,
    Pager,
    SearchSelectInput,
} from '@the-deep/deep-ui';
import { gql, useQuery } from '@apollo/client';

import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    AssessmentRegistrySummarySubDimensionTypeEnum,
    AssessmentRegistrySummarySubPillarTypeEnum,
    SummaryIssueSearchQuery,
    SummaryIssueSearchQueryVariables,
} from '#generated/types';

import { Option } from '../../formSchema';
import IssueItem, { Props as IssueProps } from './IssueItem';

import styles from './styles.css';

const SUMMARY_ISSUE_SEARCH = gql`
    query SummaryIssueSearch(
        $subPillar: AssessmentRegistrySummarySubPillarTypeEnum,
        $subDimension: AssessmentRegistrySummarySubDimensionTypeEnum,
        $search: String,
        $isParent: Boolean,
        $page: Int,
        $pageSize: Int,
    ) {
        assessmentRegSummaryIssues(
            subPillar: $subPillar,
            subDimension: $subDimension,
            search: $search,
            isParent: $isParent,
            pageSize: $pageSize,
            page: $page,
        ) {
            page
            results {
                id
                label
                parent {
                    id
                    label
                    subPillar
                    subDimension
                }
                subPillar
                subDimension
            }
            totalCount
        }
    }
`;
interface Props {
    placeholder?: string;
    subPillar?: AssessmentRegistrySummarySubPillarTypeEnum;
    subDimension?: AssessmentRegistrySummarySubDimensionTypeEnum;
    name: string;
    value?: string;
    onChange: (issueId?: string) => void;
    options?: Option[] | null;
    onOptionsChange?: React.Dispatch<React.SetStateAction<Option[] |undefined | null>>;
    error?: string;
    mode?: 'add' | 'select';
}

const keySelector = (d: NonNullable<NonNullable<SummaryIssueSearchQuery['assessmentRegSummaryIssues']>['results']>[number]) => d.id;
const labelSelector = (d: NonNullable<NonNullable<SummaryIssueSearchQuery['assessmentRegSummaryIssues']>['results']>[number]) => d.label;

function IssueSearchSelectInput(props: Props) {
    const {
        placeholder,
        name,
        subPillar,
        subDimension,
        value,
        error,
        onChange,
        options,
        onOptionsChange,
        mode = 'select',
    } = props;

    const [opened, setOpened] = useState(mode === 'add' && true);
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const variables = useMemo(
        (): SummaryIssueSearchQueryVariables => ({
            subPillar: subPillar as AssessmentRegistrySummarySubPillarTypeEnum,
            subDimension: subDimension as AssessmentRegistrySummarySubDimensionTypeEnum,
            search: debouncedSearchText,
            isParent: true,
            page,
            pageSize,
        }), [
            debouncedSearchText,
            subPillar,
            subDimension,
            page,
            pageSize,
        ],
    );

    const {
        loading,
        previousData,
        data = previousData,
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

    const issueParams = useCallback(
        (
            n: string,
            issuesData: NonNullable<NonNullable<SummaryIssueSearchQuery['assessmentRegSummaryIssues']>['results']>[number],
        ): IssueProps => ({
            name: n,
            data: issuesData,
            subPillar,
            subDimension,
        }),
        [
            subPillar,
            subDimension,
        ],
    );

    return (
        <>
            {mode === 'select' && (
                <SearchSelectInput
                    placeholder={placeholder}
                    name={name}
                    value={value}
                    onChange={onChange}
                    keySelector={keySelector}
                    labelSelector={labelSelector}
                    options={options}
                    onOptionsChange={onOptionsChange}
                    onSearchValueChange={setSearchText}
                    searchOptions={data?.assessmentRegSummaryIssues?.results}
                    totalOptionsCount={data?.assessmentRegSummaryIssues?.totalCount ?? 0}
                    optionsPending={loading}
                    onShowDropdownChange={setOpened}
                    handleShowMoreClick={handleShowMoreClick}
                    error={error}
                />
            )}
            {mode === 'add' && (
                <>
                    <ListView
                        className={styles.issueListContainer}
                        data={data?.assessmentRegSummaryIssues?.results}
                        keySelector={keySelector}
                        renderer={IssueItem}
                        rendererParams={issueParams}
                        errored={false}
                        filtered={false}
                        pending={false}
                        messageShown
                        messageIconShown
                    />

                    <Footer
                        actions={(
                            <Pager
                                activePage={page}
                                itemsCount={(data?.assessmentRegSummaryIssues?.totalCount) ?? 0}
                                maxItemsPerPage={pageSize}
                                onActivePageChange={setPage}
                                onItemsPerPageChange={setPageSize}
                            />
                        )}
                    />
                </>
            )}
        </>
    );
}
export default IssueSearchSelectInput;
