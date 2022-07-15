import React, { useState, useMemo, useCallback } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    ProjectUserQuery,
    ProjectUserQueryVariables,
} from '#generated/types';
import useDebouncedValue from '#hooks/useDebouncedValue';

import OptionLabelSelector from '../OptionLabelSelector';

import styles from './styles.css';

const PROJECT_USERS = gql`
    query ProjectUser(
    $search: String,
    $projectId: ID!,
    $page: Int,
    $pageSize: Int,
) {
        project(id: $projectId) {
            id
            userMembers(
                search: $search,
                page: $page,
                pageSize: $pageSize,
            ) {
                page
                results {
                    id
                    member {
                        id
                        displayName
                        emailDisplay
                    }
                }
                totalCount
            }
        }
    }
`;

export type BasicProjectUser = {
    id: string;
    emailDisplay: string;
    displayName?: string | null | undefined;
};

const keySelector = (d: BasicProjectUser) => d.id;
const labelSelector = (d: BasicProjectUser) => d.displayName ?? ' ';

type Def = { containerClassName?: string };
type ProjectUserSelectInputProps<K extends string> = SearchSelectInputProps<
    string,
    K,
    BasicProjectUser,
    Def,
    'keySelector' | 'labelSelector' | 'searchOptions' | 'onSearchValueChange' | 'optionsPending' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { projectId: string };

function ProjectUserSelectInput<K extends string>(props: ProjectUserSelectInputProps<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const variables = useMemo(() => ({
        search: debouncedSearchText,
        projectId,
        page: 1,
        pageSize: 10,
    }), [debouncedSearchText, projectId]);

    const {
        data,
        loading,
        fetchMore,
    } = useQuery<ProjectUserQuery, ProjectUserQueryVariables>(
        PROJECT_USERS,
        {
            variables,
            skip: !opened,
        },
    );

    const projectMembers = data?.project?.userMembers?.results;

    const members = useMemo(
        () => projectMembers?.map((item) => item.member),
        [projectMembers],
    );

    const handleShowMoreClick = useCallback(() => {
        fetchMore({
            variables: {
                ...variables,
                page: (data?.project?.userMembers?.page ?? 1) + 1,
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
                if (!previousResult.project) {
                    return previousResult;
                }

                const oldUsers = previousResult.project.userMembers;
                const newUsers = fetchMoreResult?.project?.userMembers;

                if (!newUsers) {
                    return previousResult;
                }

                return ({
                    ...previousResult,
                    project: {
                        ...previousResult.project,
                        userMembers: {
                            ...newUsers,
                            results: [
                                ...(oldUsers?.results ?? []),
                                ...(newUsers.results ?? []),
                            ],
                        },
                    },
                });
            },
        });
    }, [
        fetchMore,
        variables,
        data?.project?.userMembers?.page,
    ]);

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionLabelSelector={OptionLabelSelector}
            searchOptions={members}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
            totalOptionsCount={data?.project?.userMembers?.totalCount ?? undefined}
            optionsPopupClassName={styles.optionsPopup}
            handleShowMoreClick={handleShowMoreClick}
        />
    );
}

export default ProjectUserSelectInput;
