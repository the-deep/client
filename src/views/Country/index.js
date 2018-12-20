import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { caseInsensitiveSubmatch, compareString } from '#rsu/common';
import Page from '#rscv/Page';
import LoadingAnimation from '#rscv/LoadingAnimation';
import SearchInput from '#rsci/SearchInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import ListView from '#rscv/List/ListView';
import Modal from '#rscv/Modal';
import ModalHeader from '#rscv/Modal/Header';
import ModalBody from '#rscv/Modal/Body';

import {
    regionsListSelector,
    countryIdFromRouteSelector,

    setRegionsAction,
    activeUserSelector,
} from '#redux';
import _ts from '#ts';
import { iconNames } from '#constants';
import AddRegion from '#components/other/AddRegion';

import CountriesGetRequest from './requests/CountriesGetRequest';

import CountryDetail from './CountryDetail';
import CountryListItem from './CountryListItem';
import styles from './styles.scss';

const propTypes = {
    countries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    setRegions: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    countryId: PropTypes.number,
};

const defaultProps = {
    countries: [],
    countryId: undefined,
};

const mapStateToProps = state => ({
    countries: regionsListSelector(state),
    activeUser: activeUserSelector(state),
    countryId: countryIdFromRouteSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegions: params => dispatch(setRegionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class CountryPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { countries } = this.props;
        const displayCountryList = [...countries].sort(
            (a, b) => compareString(a.title, b.title),
        );

        this.state = {
            addCountryModal: false,
            displayCountryList,
            searchInputValue: '',
            pendingCountryList: true,
        };
    }

    componentWillMount() {
        this.startRequestForCountries();
    }

    componentWillReceiveProps(nextProps) {
        const { countries } = nextProps;
        const { searchInputValue } = this.state;
        if (this.props.countries !== countries) {
            const displayCountryList = countries.filter(
                country => caseInsensitiveSubmatch(country.title, searchInputValue),
            );
            displayCountryList.sort((a, b) => compareString(a.title, b.title));
            this.setState({ displayCountryList });
        }
    }

    componentWillUnmount() {
        if (this.countriesRequest) {
            this.countriesRequest.stop();
        }
    }

    onAddCountry = () => {
        this.setState({
            addCountryModal: true,
        });
    };

    startRequestForCountries = () => {
        if (this.countriesRequest) {
            this.countriesRequest.stop();
        }
        const countriesRequest = new CountriesGetRequest({
            setRegions: this.props.setRegions,
            setState: d => this.setState(d),
        });
        this.countriesRequest = countriesRequest.create();
        this.countriesRequest.start();
    }

    handleSearchInputChange = (searchInputValue) => {
        const displayCountryList = this.props.countries.filter(
            country => caseInsensitiveSubmatch(country.title, searchInputValue),
        );

        this.setState({
            displayCountryList,
            searchInputValue,
        });
    };

    keySelector = data => (data.countryId)

    handleModalClose = () => {
        this.setState({
            addCountryModal: false,
        });
    };

    calcCountryListItemKey = country => country.id;

    renderCountryListItem = (key, country) => {
        const { countryId } = this.props;
        const activeCountryId = countryId;
        const isActive = country.id === activeCountryId;
        return (
            <div
                key={key}
                className={styles.countryListItem}
            >
                <CountryListItem
                    key={key}
                    countryId={country.id}
                    title={country.title}
                    isActive={isActive}
                />
            </div>
        );
    }

    renderCountryDetail = () => {
        const {
            countryId,
            countries,
        } = this.props;

        const activeCountryId = countryId;

        if (countries.length <= 0) {
            return (
                <div className={styles.countryDetailAlt}>
                    {_ts('countries', 'noCountriesText')}
                </div>
            );
        }

        if (!activeCountryId) {
            return (
                <div className={styles.countryDetailAlt}>
                    {_ts('countries', 'selectCountryText')}
                </div>
            );
        }

        const activeCountryIndex = countries.findIndex(
            country => country.id === activeCountryId,
        );

        if (activeCountryIndex >= 0) {
            return (
                <CountryDetail
                    countryId={activeCountryId}
                    key={activeCountryId}
                    className={styles.countryDetail}
                />
            );
        }

        return (
            <div className={styles.countryDetailAlt}>
                {_ts('countries', 'countryNotFoundText')}
            </div>
        );
    }

    render() {
        const {
            displayCountryList,
            pendingCountryList,
        } = this.state;
        const { activeUser } = this.props;

        if (pendingCountryList) {
            return (
                <div className={styles.loading}>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <React.Fragment>
                <Page
                    className={styles.countryPanel}
                    sidebarClassName={styles.sidebar}
                    sidebar={
                        <React.Fragment>
                            <header className={styles.header}>
                                <h3 className={styles.heading}>
                                    {_ts('countries', 'countriesLabel')}
                                </h3>
                                { activeUser.isSuperuser && (
                                    <PrimaryButton
                                        iconName={iconNames.add}
                                        onClick={this.onAddCountry}
                                    >
                                        {_ts('countries', 'addCountryButtonLabel')}
                                    </PrimaryButton>
                                ) }
                                <SearchInput
                                    className={styles.searchInput}
                                    onChange={this.handleSearchInputChange}
                                    placeholder={_ts('countries', 'searchCountryPlaceholer')}
                                    value={this.state.searchInputValue}
                                    showLabel={false}
                                    showHintAndError={false}
                                />
                            </header>
                            <ListView
                                className={styles.countryList}
                                modifier={this.renderCountryListItem}
                                data={displayCountryList}
                                keySelector={this.calcCountryListItemKey}
                            />
                        </React.Fragment>
                    }
                    mainContentClassName={styles.mainContent}
                    mainContent={this.renderCountryDetail()}
                />
                { this.state.addCountryModal && (
                    <Modal
                        closeOnEscape
                        onClose={this.handleModalClose}
                        closeOnBlur
                    >
                        <ModalHeader title={_ts('countries', 'addCountryModalHeaderLabel')} />
                        <ModalBody>
                            <AddRegion onModalClose={this.handleModalClose} />
                        </ModalBody>
                    </Modal>
                ) }
            </React.Fragment>
        );
    }
}
