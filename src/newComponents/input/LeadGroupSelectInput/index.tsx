import React, { useState, useMemo } from 'react';
import {
    SearchSelectInput,
    SearchSelectInputProps,
} from '@the-deep/deep-ui';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import {
    MultiResponse,
} from '#typings';

export interface BasicLeadGroup {
    id: number;
    title: string;
}

const keySelector = (d: BasicLeadGroup) => d.id;
const labelSelector = (d: BasicLeadGroup) => d.title;

type Def = { containerClassName?: string };
type LeadGroupSelectInputProps<K extends string> = SearchSelectInputProps<
    number,
    K,
    BasicLeadGroup,
    Def,
    'keySelector' | 'labelSelector' | 'searchOptions' | 'onSearchValueChange' | 'optionsPending' | 'totalOptionsCount' | 'onShowDropdownChange'
> & { projectId: number };

function LeadGroupSelectInput<K extends string>(props: LeadGroupSelectInputProps<K>) {
    const {
        className,
        projectId,
        ...otherProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        pending: leadGroupGetPending,
        response: leadGroups,
    } = useRequest<MultiResponse<BasicLeadGroup>>({
        url: `server://projects/${projectId}/lead-groups/`,
        method: 'GET',
        skip: !opened,
        query: searchQueryParams,
    });

    return (
        <SearchSelectInput
            {...otherProps}
            className={className}
            keySelector={keySelector}
            labelSelector={labelSelector}
            searchOptions={leadGroups?.results}
            onSearchValueChange={setSearchText}
            optionsPending={leadGroupGetPending}
            totalOptionsCount={leadGroups?.count}
            onShowDropdownChange={setOpened}
        />
    );
}

export default LeadGroupSelectInput;
