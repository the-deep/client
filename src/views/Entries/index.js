import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import { pathNames } from '#constants/';
import {
    reverseRoute,
    isObjectEmpty,
} from '#rsu/common';

import Message from '#rscv/Message';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';

import _ts from '#ts';

import {
    setEntriesAction,
    entriesForProjectSelector,
    entriesViewFilterSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
    unsetEntriesViewFilterAction,

    setGeoOptionsAction,

    projectIdFromRouteSelector,

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,
} from '#redux';

import EntriesRequest from './requests/EntriesRequest';
import FrameworkRequest from './requests/FrameworkRequest';
import GeoOptionsRequest from './requests/GeoOptionsRequest';

import FilterEntriesForm from './FilterEntriesForm';
import LeadGroupedEntries from './LeadGroupedEntries';

import styles from './styles.scss';

const mapStateToProps = state => ({
    activePage: entriesViewActivePageSelector(state),
    entriesFilter: entriesViewFilterSelector(state),
    framework: analysisFrameworkForProjectSelector(state),
    leadGroupedEntriesList: entriesForProjectSelector(state),
    projectId: projectIdFromRouteSelector(state),
    totalEntriesCount: totalEntriesCountForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setEntriesViewActivePage: params => dispatch(setEntriesViewActivePageAction(params)),
    setFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    // setProject: params => dispatch(setProjectAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
});

const propTypes = {

    activePage: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    entriesFilter: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    framework: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    leadGroupedEntriesList: PropTypes.array.isRequired,
    projectId: PropTypes.number.isRequired,
    totalEntriesCount: PropTypes.number,

    setEntries: PropTypes.func.isRequired,
    setEntriesViewActivePage: PropTypes.func.isRequired,
    setFramework: PropTypes.func.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
    unsetEntriesViewFilter: PropTypes.func.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    framework: {},
    totalEntriesCount: 0,
};

const leadKeySelector = d => d.id;

const MAX_ENTRIES_PER_REQUEST = 5;

@connect(mapStateToProps, mapDispatchToProps)
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
            pendingFramework: true,
            pendingGeoOptions: true,
        };

        this.entriesRequest = new EntriesRequest({
            getFilters: () => this.props.entriesFilter,
            getLimit: () => MAX_ENTRIES_PER_REQUEST,
            getOffset: () => (this.props.activePage - 1) * MAX_ENTRIES_PER_REQUEST,
            getProjectId: () => this.props.projectId,
            setEntries: this.props.setEntries,
            setState: params => this.setState(params),
        });

        this.geoOptionsRequest = new GeoOptionsRequest({
            setState: params => this.setState(params),
            getProjectId: () => this.props.projectId,
            setGeoOptions: this.props.setGeoOptions,
        });

        this.frameworkRequest = new FrameworkRequest({
            setState: params => this.setState(params),
            getProjectId: () => this.props.projectId,
            setFramework: this.props.setFramework,
        });

        this.leadEntries = React.createRef();
    }

    componentDidMount() {
        this.entriesRequest.init();
        this.entriesRequest.start();

        this.geoOptionsRequest.init();
        this.geoOptionsRequest.start();

        this.frameworkRequest.init();
        this.frameworkRequest.start();

        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: oldProjectId,
            framework: oldAf,
            entriesFilter: oldFilter,
            activePage: oldActivePage,
        } = this.props;
        const {
            projectId: newProjectId,
            framework: newAf,
            entriesFilter: newFilter,
            activePage: newActivePage,
        } = nextProps;

        if (oldProjectId !== newProjectId) {
            this.setState({
                pendingEntries: true,
                pendingFramework: true,
                pendingGeoOptions: true,
            });

            this.frameworkRequest.init();
            this.frameworkRequest.start();

            this.geoOptionsRequest.init();
            this.geoOptionsRequest.start();

            this.entriesRequest.init();
            this.entriesRequest.start();
            return;
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }

        if (oldFilter !== newFilter || oldActivePage !== newActivePage) {
            this.entriesRequest.init();
            this.entriesRequest.start();
        }
    }

    componentWillUnmount() {
        this.entriesRequest.stop();
        this.geoOptionsRequest.stop();
        this.frameworkRequest.stop();

        window.removeEventListener('scroll', this.handleScroll, true);
    }

    handleScroll = (e) => {
        const headers = e.target.getElementsByClassName(styles.leadGroupedHeader);
        for (let i = 0; i < headers.length; i += 1) {
            headers[i].style.transform = `translateX(${e.target.scrollLeft}px)`;
        }
    }

    handlePageClick = (page) => {
        this.props.setEntriesViewActivePage({ activePage: page });
    }

    rendererParams = (key, datum) => {
        const {
            projectId,
            framework: {
                widgets,
            },
        } = this.props;

        return ({
            headerClassName: styles.leadGroupedHeader,
            lead: datum,
            projectId,
            widgets,
        });
    }

    renderEmptyEntriesMessage = () => {
        const {
            projectId,
            entriesFilters,
        } = this.props;
        const isFilterEmpty = isObjectEmpty(entriesFilters);

        if (!isFilterEmpty) {
            return (
                <Message>
                    { _ts('entries', 'emptyEntriesForFilterMessage') }
                </Message>
            );
        }
        return (
            <Message>
                { _ts('entries', 'emptyEntriesMessage') }
                <Link
                    className={styles.emptyEntriesLinkMessage}
                    to={reverseRoute(pathNames.leads, { projectId })}
                >
                    { _ts('entries', 'emptyEntriesLinkMessage') }
                </Link>
            </Message>
        );
    }

    render() {
        const {
            leadGroupedEntriesList,
            framework,
            activePage,
            totalEntriesCount,
        } = this.props;

        const {
            pendingGeoOptions,
            pendingEntries,
            pendingFramework,
        } = this.state;

        const blockedLoading = pendingGeoOptions || pendingFramework;
        const nonBlockedLoading = pendingEntries;

        return (
            <div className={styles.entriesView}>
                <header className={styles.header}>
                    <FilterEntriesForm
                        pending={pendingFramework}
                        filters={framework.filters}
                    />
                </header>
                <div className={styles.leadGroupedEntriesList}>
                    {
                        blockedLoading ? (
                            <LoadingAnimation />
                        ) : (
                            <Fragment>
                                { nonBlockedLoading && <LoadingAnimation /> }
                                {
                                    leadGroupedEntriesList.length > 0
                                        ? <List
                                            className={styles.leadGroupedEntriesList}
                                            data={leadGroupedEntriesList}
                                            renderer={LeadGroupedEntries}
                                            keySelector={leadKeySelector}
                                            rendererParams={this.rendererParams}
                                        />
                                        : this.renderEmptyEntriesMessage()
                                }
                            </Fragment>
                        )
                    }
                </div>
                {
                    totalEntriesCount > 0 &&
                    <footer className={styles.footer}>
                        <Pager
                            activePage={activePage}
                            itemsCount={totalEntriesCount}
                            maxItemsPerPage={MAX_ENTRIES_PER_REQUEST}
                            onPageClick={this.handlePageClick}
                            showItemsPerPageChange={false}
                        />
                    </footer>
                }
            </div>
        );
    }
}
