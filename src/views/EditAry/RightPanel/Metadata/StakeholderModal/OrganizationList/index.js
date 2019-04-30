import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';

import {
    _cs,
    caseInsensitiveSubmatch,
    getRatingForContentInString as rate,
    compareStringSearch,
} from '@togglecorp/fujs';

import Modalize from '#rscg/Modalize';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';

import SearchInput from '#rsci/SearchInput';
import AddOrganizationModal from '../AddOrganizationModal';

import OrganizationItem from './OrganizationItem';
import styles from './styles.scss';

// FIXME: Use strings everywhere, define all the props
// FIXME: No inline functions

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    sources: PropTypes.object,
};

const defaultProps = {
    className: '',
    sources: {},
};

const MAX_DISPLAY_ORGANIZATIONS = 50;
const organizationLabelSelector = organization => organization.label;
const organizationAbbrSelector = organization => organization.shortName;
const organizationKeySelector = item => item.key;

const PrimaryModalButton = Modalize(PrimaryButton);

export default class OrganizationList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
        };
    }

    getOrganizationItemRendererParams = (key, d) => ({
        isDonor: d.donor,
        itemKey: key,
        logo: d.logo,
        longName: d.longName,
        name: d.label,
        searchValue: this.state.searchValue,
        shortName: d.shortName,
    })

    filterOrganization = memoize((options, value) => {
        if (value === '') {
            return {
                isCapped: false,
                organizations: [],
            };
        }

        const newOptions = options
            .filter(option => (
                value === undefined
                    || caseInsensitiveSubmatch(organizationLabelSelector(option), value)
                    || caseInsensitiveSubmatch(organizationAbbrSelector(option), value)
            ))
            .sort((a, b) => (
                compareStringSearch(
                    organizationAbbrSelector(a),
                    organizationAbbrSelector(b),
                    value,
                ) || compareStringSearch(
                    organizationLabelSelector(a),
                    organizationLabelSelector(b),
                    value,
                )
            ));

        const resultsCapped = newOptions.length > MAX_DISPLAY_ORGANIZATIONS;
        return {
            isCapped: resultsCapped,
            organizations: newOptions.slice(0, MAX_DISPLAY_ORGANIZATIONS),
        };
    });


    handleSearch = (value) => {
        this.setState({ searchValue: value });
    }

    renderEmpty = () => (
        // FIXME: use strings
        <div className={styles.emptyComponent}>
            { this.state.searchValue.length === 0 ? (
                'Start typing above to search for the organization'
            ) : (
                'No result found, try different search text'
            )}
        </div>
    )

    render() {
        const {
            sources,
            className,
        } = this.props;

        const { searchValue } = this.state;

        const {
            isCapped,
            organizations,
        } = this.filterOrganization(sources.organizations, searchValue);

        return (
            <div className={_cs(styles.organizationList, className)}>
                <div className={styles.top}>
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            Organizations
                        </h3>
                        <PrimaryModalButton
                            className={styles.addOrganizationButton}
                            modal={
                                <AddOrganizationModal
                                    organizationTypeList={sources.organizationType}
                                />
                            }
                        >
                            {/* FIXME: Use strings */}
                            Add new
                        </PrimaryModalButton>
                    </header>
                    <SearchInput
                        className={styles.searchInput}
                        label="Search"
                        // FIXME: Use strings
                        placeholder="Any organization"
                        value={searchValue}
                        onChange={this.handleSearch}
                        showHintAndError={false}
                    />
                </div>
                { isCapped && (
                    <div className={styles.capWarning}>
                        <Icon
                            name="info"
                            className={styles.icon}
                        />
                        <div className={styles.text}>
                            {/* FIXME: Use strings */}
                            Showing only top {MAX_DISPLAY_ORGANIZATIONS} results
                        </div>
                    </div>
                )}
                <ListView
                    className={styles.content}
                    data={organizations}
                    emptyComponent={this.renderEmpty}
                    rendererParams={this.getOrganizationItemRendererParams}
                    keySelector={organizationKeySelector}
                    renderer={OrganizationItem}
                />
            </div>
        );
    }
}
