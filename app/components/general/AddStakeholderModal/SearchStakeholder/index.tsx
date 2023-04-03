import React, { useCallback, useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ListView,
    TextInput,
    Container,
    Kraken,
} from '@the-deep/deep-ui';
import {
    useQuery,
    gql,
} from '@apollo/client';

import useDebouncedValue from '#hooks/useDebouncedValue';
import AddOrganizationButton from '#components/general/AddOrganizationButton';
import _ts from '#ts';
import {
    OrganizationsListQuery,
    OrganizationsListQueryVariables,
} from '#generated/types';

import Stakeholder, { OrganizationItemType } from './Stakeholder';
import styles from './styles.css';

const ORGANIZATIONS_LIST = gql`
query OrganizationsList($search: String) {
    organizations(search: $search) {
        totalCount
        results {
            id
            longName
            shortName
            title
            url
            verified
            organizationType {
                id
                title
                shortName
                description
            }
            logo {
                id
                title
                file {
                    name
                    url
                }
            }
        }
    }
}
`;

const stakeholderKeySelector = (d: OrganizationItemType) => d.id;

interface Props {
    className?: string;
}

function SearchStakeholder(props: Props) {
    const {
        className,
    } = props;

    const [searchText, setSearchText] = useState<string | undefined>();
    const debouncedSearchText = useDebouncedValue(searchText);

    const organizationsVariables = useMemo(() => ({
        search: debouncedSearchText,
    }), [debouncedSearchText]);

    const {
        data: organizationsList,
        loading: organizationsListPending,
    } = useQuery<OrganizationsListQuery, OrganizationsListQueryVariables>(
        ORGANIZATIONS_LIST,
        {
            skip: !searchText,
            variables: organizationsVariables,
        },
    );

    const stakeholderRendererParams = useCallback((_: string, data: OrganizationItemType) => ({
        searchValue: searchText,
        value: data,
    }), [searchText]);

    const emptyMessage = useMemo(() => (
        (organizationsList?.organizations?.totalCount ?? 0) === 0 && !searchText
            ? _ts('project.detail.stakeholders', 'typeToSearchOrganizationMessage')
            : _ts('project.detail.stakeholders', 'noResultsFoundMessage')
    ), [
        searchText,
        organizationsList?.organizations?.totalCount,
    ]);

    const handleSearchTextChange = useCallback((newValue: string | undefined) => {
        setSearchText(newValue);
    }, []);

    const handleOrganizationAdd = useCallback((v: OrganizationItemType) => {
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
                pending={organizationsListPending}
                data={organizationsList?.organizations?.results}
                renderer={Stakeholder}
                keySelector={stakeholderKeySelector}
                errored={false}
                rendererParams={stakeholderRendererParams}
                emptyIcon={(
                    <Kraken
                        variant="exercise"
                    />
                )}
                filtered={(searchText?.length ?? 0) > 0}
                filteredEmptyIcon={(
                    <Kraken
                        variant="search"
                    />
                )}
                filteredEmptyMessage="No matching organization found."
                messageIconShown
                messageShown
            />
        </Container>
    );
}

export default SearchStakeholder;
