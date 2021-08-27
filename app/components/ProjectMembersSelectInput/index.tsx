import React from 'react';
import { SearchMultiSelectInput, SearchMultiSelectInputProps } from '@the-deep/deep-ui';
import { Membership, MultiResponse } from '#types';

import { useRequest } from '#base/utils/restRequest';

type Def = { containerClassName?: string };
type Props<K extends string> = SearchMultiSelectInputProps<
    number,
    K,
    Membership,
    Def,
    'onSearchValueChange' | 'searchOptions' | 'optionsPending' | 'keySelector' | 'labelSelector' | 'totalOptionsCount' | 'onShowDropdownChange'
> & {
    projectId: number;
};
const keySelector = (d: Membership) => d.member;
const labelSelector = (d: Membership) => d.memberName;

const memberFieldQuery = {
    fields: ['member', 'member_name'],
};

function ProjectMembersMultiSelectInput<K extends string>(props: Props<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const {
        pending,
        response,
    } = useRequest<MultiResponse<Membership>>(
        {
            url: `server://v2/projects/${projectId}/project-memberships/`,
            method: 'GET',
            query: memberFieldQuery,
            failureHeader: 'Project Membership',
        },
    );

    return (
        <SearchMultiSelectInput
            {...otherProps}
            className={className}
            searchOptions={response?.results}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionsPending={pending}
        />
    );
}

export default ProjectMembersMultiSelectInput;
