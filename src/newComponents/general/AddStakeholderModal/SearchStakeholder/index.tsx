import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    TextInput,
    Header,
} from '@the-deep/deep-ui';
import { Organization, MultiResponse } from '#types';

import { useRequest } from '#utils/request';
import useDebouncedValue from '#hooks/useDebouncedValue';
import _ts from '#ts';
import AddOrganizationButton from '#newComponents/general/AddOrganizationButton';
import Stakeholder from './Stakeholder';
import styles from './styles.scss';

const stakeholderKeySelector = (d: Organization) => d.id.toString();
const SEARCH_LIMIT = 25;

interface Props {
    className?: string;
}

function SearchStakeholder(props: Props) {
    const {
        className,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const debouncedSearchText = useDebouncedValue(searchText);

    const searchQueryParams = useMemo(() => ({
        search: debouncedSearchText,
        limit: SEARCH_LIMIT,
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
            failureHeader: _ts('project.detail.stakeholders', 'stakeholdersModalTitle'),
        },
    );

    const stakeholderRendererParams = useCallback((_: string, data: Organization) => ({
        searchValue: searchText,
        value: data,
    }), [searchText]);

    const emptyMessage = useMemo(() => ((stakeholders?.count ?? 0) === 0 && !searchText ?
        _ts('project.detail.stakeholders', 'typeToSearchOrganizationMessage')
        : _ts('project.detail.stakeholders', 'noResultsFoundMessage')),
    [searchText, stakeholders?.count]);

    const handleSearchTextChange = useCallback((newValue: string | undefined) => {
        setSearchText(newValue);
    }, []);

    const handleOrganizationAdd = useCallback((v: Organization) => {
        setSearchText(v.title);
    }, []);

    return (
        <div className={_cs(className, styles.searchStakeholder)}>
            <Header
                heading={_ts('project.detail.stakeholders', 'organizationsTitle')}
                headingSize="medium"
                actions={(
                    <AddOrganizationButton
                        onOrganizationAdd={handleOrganizationAdd}
                    />
                )}
            />
            <TextInput
                className={styles.searchInput}
                name="search"
                onChange={handleSearchTextChange}
                value={searchText}
                label={_ts('project.detail.stakeholders', 'searchLabel')}
                placeholder={_ts('project.detail.stakeholders', 'searchLabel')}
            />
            <ListView
                className={styles.items}
                pendingMessage={_ts('project.detail.stakeholders', 'searching')}
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
