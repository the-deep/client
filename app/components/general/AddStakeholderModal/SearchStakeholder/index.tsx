import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    TextInput,
    Container,
} from '@the-deep/deep-ui';
import { Organization, MultiResponse } from '#types';

import { useRequest } from '#base/utils/restRequest';
import useDebouncedValue from '#hooks/useDebouncedValue';
import AddOrganizationButton from '#components/general/AddOrganizationButton';
import _ts from '#ts';

import Stakeholder from './Stakeholder';
import styles from './styles.css';

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

    const emptyMessage = useMemo(() => ((stakeholders?.count ?? 0) === 0 && !searchText
        ? _ts('project.detail.stakeholders', 'typeToSearchOrganizationMessage')
        : _ts('project.detail.stakeholders', 'noResultsFoundMessage')),
    [searchText, stakeholders?.count]);

    const handleSearchTextChange = useCallback((newValue: string | undefined) => {
        setSearchText(newValue);
    }, []);

    const handleOrganizationAdd = useCallback((v: Organization) => {
        setSearchText(v.title);
    }, []);

    return (
        <Container
            className={_cs(className, styles.searchStakeholder)}
            heading={_ts('project.detail.stakeholders', 'organizationsTitle')}
            headingSize="extraSmall"
            headerDescription={(
                <TextInput
                    name="search"
                    onChange={handleSearchTextChange}
                    value={searchText}
                    label={_ts('project.detail.stakeholders', 'searchLabel')}
                    placeholder={_ts('project.detail.stakeholders', 'searchLabel')}
                />
            )}
            headerActions={(
                <AddOrganizationButton
                    onOrganizationAdd={handleOrganizationAdd}
                />
            )}
        >
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
        </Container>
    );
}

export default SearchStakeholder;
