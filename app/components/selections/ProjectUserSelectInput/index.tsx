import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';
import { useQuery, gql } from '@apollo/client';

import {
    ProjectUserQuery,
    ProjectUserQueryVariables,
} from '#generated/types';
import styles from './styles.css';

import useDebouncedValue from '#hooks/useDebouncedValue';

const PROJECT_USERS = gql`
    query ProjectUser($search: String, $projectId: ID!) {
        project(id: $projectId) {
            id
            userMembers(search: $search) {
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

export type BasicProjectUser = NonNullable<NonNullable<NonNullable<NonNullable<ProjectUserQuery['project']>['userMembers']>['results']>[number]>['member'];
const keySelector = (d: BasicProjectUser) => d.id;
const labelSelector = (d: BasicProjectUser) => d.displayName ?? '';

function optionLabelSelector(d: BasicProjectUser) {
    const displayName = d.displayName ?? '';
    return (
        <div className={styles.option}>
            <div className={styles.displayName}>
                {displayName}
            </div>
            <div className={styles.email}>
                {d.emailDisplay}
            </div>
        </div>
    );
}

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
    }), [debouncedSearchText, projectId]);

    const { data, loading } = useQuery<ProjectUserQuery, ProjectUserQueryVariables>(
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

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionLabelSelector={optionLabelSelector}
            searchOptions={members}
            onSearchValueChange={setSearchText}
            optionsPending={loading}
            onShowDropdownChange={setOpened}
            totalOptionsCount={data?.project?.userMembers?.totalCount ?? undefined}
            optionsPopupClassName={styles.optionsPopup}
            optionsPopupContentClassName={styles.optionsPopupContent}
        />
    );
}

export default ProjectUserSelectInput;
