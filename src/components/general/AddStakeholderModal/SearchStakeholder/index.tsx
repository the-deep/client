import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    TextInput,
} from '@the-deep/deep-ui';
import { Organization, MultiResponse } from '#typings';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';
import { notifyOnFailure } from '#utils/requestNotify';

import Stakeholder from './Stakeholder';
import styles from './styles.scss';

interface Props {
    className?: string;
}

const stakeholderKeySelector = (d: Organization) => d.id.toString();
function SearchStakeholder(props: Props) {
    const {
        className,
    } = props;

    console.warn('className', className);
    const [searchText, setSearchText] = useState<string | undefined>();
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        pending,
        response: stakeholders,
    } = useRequest<MultiResponse<Organization>>(
        {
            url: 'server://organizations/',
            method: 'GET',
            skip: !searchText,
            query: searchQueryParams,
            onFailure: (_, errorBody) =>
                notifyOnFailure(_ts('components.organizationSelectInput', 'title'))({ error: errorBody }),
        },
    );

    const stakeholderRendererParams = useCallback((_: string, data: Organization) => ({
        searchValue: searchText,
        value: data,
    }), [searchText]);

    const emptyMessage = useMemo(() => ((stakeholders?.count ?? 0) === 0 && !searchText ?
        _ts('assessment.metadata.stakeholder', 'typeToSearchOrganizationMessage')
        : _ts('assessment.metadata.stakeholder', 'noResultsFoundMessage')),
    [searchText, stakeholders?.count]);

    console.warn('emptymessage', stakeholders?.count === 0 && !searchText, emptyMessage);
    return (
        <div className={_cs(className, styles.search)}>
            <TextInput
                name="search"
                onChange={setSearchText}
                value={searchText}
                label="Search Stakeholder"
                placeholder="Search Stakeholder"
            />
            <ListView
                className={styles.items}
                pendingMessage={_ts('assessment.metadata.stakeholder', 'searching')}
                emptyMessage={emptyMessage}
                pending={pending}
                data={stakeholders?.results}
                renderer={Stakeholder}
                keySelector={stakeholderKeySelector}
                rendererParams={stakeholderRendererParams}
            />
        </div>
    );
}

export default SearchStakeholder;
