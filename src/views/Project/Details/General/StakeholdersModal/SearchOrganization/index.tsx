import React, { useCallback, useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import ListView from '#rscv/List/ListView';
import SearchInput from '#rsci/SearchInput';
import OrganizationItem from '#components/other/OrganizationItem';
import AddOrganizationModal from '#components/other/AddOrganizationModal';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Modalize from '#rscg/Modalize';
import Message from '#rscv/Message';

import _ts from '#ts';

import styles from './styles.scss';

const PrimaryModalButton = Modalize(PrimaryButton);

interface Props {
    className?: string;
    organizationList: Organization[];
    handleSearch: (searchText?: string) => void;
    pending: boolean;
}

interface Organization {
    id: number;
    title: string;
    shortName: string;
    longName: string;
    url: string;
    logo: string;
}

const organizationKeySelector = (d: Organization) => d.id;

function SearchOrganization(props: Props) {
    const {
        className,
        organizationList,
        handleSearch,
        pending,
    } = props;

    const [searchText, setSearchValue] = useState<string>('');

    const handleChange = useCallback((value: string) => {
        setSearchValue(value);
        if (handleSearch) {
            handleSearch(value);
        }
    }, [setSearchValue, handleSearch]);

    const renderEmpty = useCallback(() => {
        if (pending) {
            return (
                <div className={styles.emptyComponent}>
                    <Message>
                        {_ts('assessment.metadata.stakeholder', 'searching')}
                    </Message>
                </div>
            );
        }
        return (
            <div className={styles.emptyComponent}>
                { organizationList.length === 0 && !searchText ?
                    (
                        <Message>
                            {_ts('assessment.metadata.stakeholder', 'typeToSearchOrganizationMessage')}
                        </Message>
                    ) : (
                        <Message>
                            {_ts('assessment.metadata.stakeholder', 'noResultsFoundMessage')}
                        </Message>

                    )}
            </div>
        );
    }, [organizationList, pending, searchText]);

    const handleOrganizationAdd = useCallback((organization: Organization) => {
        handleChange(organization.title);
    }, [handleChange]);

    const getOrganizationItemRendererParams = (_: number, data: Organization) => {
        const {
            id,
            title,
            logo,
            shortName,
            longName,
        } = data;

        return ({
            itemKey: id,
            logo,
            shortName,
            longName,
            name: title,
            searchValue: searchText,
        });
    };

    return (
        <div className={_cs(styles.searchList, className)}>
            <div className={styles.top}>
                <header className={styles.header}>
                    <h3 className={styles.heading}>
                        {_ts('project.detail.stakeholders', 'organizationsTitle')}
                    </h3>
                    <PrimaryModalButton
                        className={styles.addOrganizationButton}
                        modal={
                            <AddOrganizationModal
                                onOrganizationAdd={handleOrganizationAdd}
                                loadOrganizationList
                            />
                        }
                        iconName="add"
                    >
                        {_ts('project.detail.stakeholders', 'addNewOrganizationTitle')}
                    </PrimaryModalButton>
                </header>
                <SearchInput
                    className={styles.searchInput}
                    label={_ts('project.detail.stakeholders', 'searchInputLabel')}
                    placeholder={_ts('project.detail.stakeholders', 'searchInputPlaceholder')}
                    value={searchText}
                    onChange={handleChange}
                    showHintAndError={false}
                />
            </div>
            <ListView
                className={styles.content}
                data={organizationList}
                emptyComponent={renderEmpty}
                rendererParams={getOrganizationItemRendererParams}
                keySelector={organizationKeySelector}
                renderer={OrganizationItem}
            />
        </div>
    );
}

export default SearchOrganization;
