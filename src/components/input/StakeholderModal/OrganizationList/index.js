import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import {
    _cs,
    caseInsensitiveSubmatch,
    compareStringSearch,
    listToMap,
} from '@togglecorp/fujs';

import Modalize from '#rscg/Modalize';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import Icon from '#rscg/Icon';
import ListView from '#rscv/List/ListView';
import SearchInput from '#rsci/SearchInput';

import {
    projectIdFromRoute,
    setNewOrganizationAction,
} from '#redux';

import AddOrganizationModal from '#components/other/AddOrganizationModal';
import _ts from '#ts';

import OrganizationItem from '#components/other/OrganizationItem';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    sources: PropTypes.object,

    projectId: PropTypes.number.isRequired,

    setNewOrganization: PropTypes.func.isRequired,
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

const mapStateToProps = state => ({
    projectId: projectIdFromRoute(state),
});

const mapDispatchToProps = dispatch => ({
    setNewOrganization: params => dispatch(setNewOrganizationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class OrganizationList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
        };
    }

    getOrganizationTypesMap = memoize((sources) => {
        const {
            organizationType,
        } = sources;

        const organizationTypesMap = listToMap(
            organizationType,
            d => d.id,
            d => d,
        );

        return organizationTypesMap;
    })

    getOrganizationItemRendererParams = (key, d) => {
        const { searchValue } = this.state;
        const { sources } = this.props;

        const organizationTypes = this.getOrganizationTypesMap(sources);

        return ({
            itemKey: key,
            logo: d.logo,
            longName: d.longName,
            name: d.label,
            searchValue,
            shortName: d.shortName,
            type: d.organizationType,
            organizationType: organizationTypes[d.organizationType],
        });
    }

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

    handleOrganizationAdd = (organization) => {
        const {
            projectId,
            setNewOrganization,
        } = this.props;

        const newOrganization = {
            key: organization.id,
            label: organization.title,
            shortName: organization.shortName,
            logo: organization.logoUrl,
        };

        setNewOrganization({
            projectId,
            organization: newOrganization,
        });
    }

    handleSearch = (value) => {
        this.setState({ searchValue: value });
    }

    renderEmpty = () => (
        <div className={styles.emptyComponent}>
            { this.state.searchValue.length === 0 ? (
                _ts('assessment.metadata.stakeholder', 'typeToSearchOrganizationMessage')
            ) : (
                _ts('assessment.metadata.stakeholder', 'noResultsFoundMessage')
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
                            {_ts('assessment.metadata.stakeholder', 'organizationsTitle')}
                        </h3>
                        <PrimaryModalButton
                            className={styles.addOrganizationButton}
                            modal={
                                <AddOrganizationModal
                                    organizationTypeList={sources.organizationType}
                                    onOrganizationAdd={this.handleOrganizationAdd}
                                />
                            }
                            iconName="add"
                        >
                            {_ts('assessment.metadata.stakeholder', 'addNewOrganizationTitle')}
                        </PrimaryModalButton>
                    </header>
                    <SearchInput
                        className={styles.searchInput}
                        label={_ts('assessment.metadata.stakeholder', 'searchInputLabel')}
                        placeholder={_ts('assessment.metadata.stakeholder', 'searchInputPlaceholder')}
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
                            {_ts('assessment.metadata.stakeholder', 'maxDisplayWarning', { max: MAX_DISPLAY_ORGANIZATIONS })}
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
