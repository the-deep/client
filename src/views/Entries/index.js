import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import { pathNames } from '#constants/';
import {
    _cs,
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Message from '#rscv/Message';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import Page from '#rscv/Page';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';

import _ts from '#ts';
import noSearch from '#resources/img/no-search.png';
import noFilter from '#resources/img/no-filter.png';

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
    geoOptionsForProjectSelector,
} from '#redux';

import EntriesRequest from './requests/EntriesRequest';
import FrameworkRequest from './requests/FrameworkRequest';
import GeoOptionsRequest from './requests/GeoOptionsRequest';

import EntriesViz from './EntriesViz';
import FilterEntriesForm from './FilterEntriesForm';
import LeadGroupedEntries from './LeadGroupedEntries';

import styles from './styles.scss';

const LIST_VIEW = 'list';
const VIZ_VIEW = 'viz';

const tabsIcons = {
    [LIST_VIEW]: 'list',
    [VIZ_VIEW]: 'visualization',
};


const Tab = ({
    className,
    view,
    onClick,
}) => (
    <button
        type="button"
        className={_cs(styles.tab, className)}
        onClick={onClick}
    >
        <Icon name={tabsIcons[view]} />
    </button>
);

Tab.propTypes = {
    className: PropTypes.string,
    view: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

Tab.defaultProps = {
    className: '',
    onClick: undefined,
};

const mapStateToProps = state => ({
    activePage: entriesViewActivePageSelector(state),
    entriesFilter: entriesViewFilterSelector(state),
    framework: analysisFrameworkForProjectSelector(state),
    leadGroupedEntriesList: entriesForProjectSelector(state),
    projectId: projectIdFromRouteSelector(state),
    totalEntriesCount: totalEntriesCountForProjectSelector(state),
    entriesFilters: entriesViewFilterSelector(state),
    geoOptions: geoOptionsForProjectSelector(state),
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
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types

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
    geoOptions: {},
};

const leadKeySelector = d => d.id;

const MAX_ENTRIES_PER_REQUEST = 50;

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

            successFramework: false,
            successGeoOptions: false,

            view: LIST_VIEW,
        };

        this.views = {
            [LIST_VIEW]: {
                component: this.renderListView,
                wrapContainer: true,
                // mount: true,
                // lazyMount: true,
            },
            [VIZ_VIEW]: {
                component: EntriesViz,
                wrapContainer: true,
                // mount: true,
                // lazyMount: true,
                rendererParams: () => ({
                    projectId: this.props.projectId,
                }),
            },
        };

        this.entriesRequest = new EntriesRequest({
            getFilters: () => this.props.entriesFilter,
            getLimit: () => MAX_ENTRIES_PER_REQUEST,
            getOffset: () => (this.props.activePage - 1) * MAX_ENTRIES_PER_REQUEST,
            getProjectId: () => this.props.projectId,
            setEntries: this.props.setEntries,
            setState: params => this.setState(params),
            getFramework: () => this.props.framework,
            getGeoOptions: () => this.props.geoOptions,
        });

        this.geoOptionsRequest = new GeoOptionsRequest({
            setState: params => this.setState(params),
            getProjectId: () => this.props.projectId,
            setGeoOptions: this.props.setGeoOptions,
            setSuccess: () => this.setState({ successGeoOptions: true }, this.startEntriesRequest),
        });

        this.frameworkRequest = new FrameworkRequest({
            setState: params => this.setState(params),
            getProjectId: () => this.props.projectId,
            setFramework: this.props.setFramework,
            setSuccess: () => this.setState({ successFramework: true }, this.startEntriesRequest),
        });

        this.leadEntries = React.createRef();
    }

    componentDidMount() {
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

            // this.entriesRequest.init();
            // this.entriesRequest.start();
            return;
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }

        if (oldFilter !== newFilter || oldActivePage !== newActivePage) {
            // FIXME: only if not pending anything
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

    getTabs = memoize((framework) => {
        if (framework.properties && framework.properties.statsConfig) {
            return {
                tabs: {
                    [LIST_VIEW]: LIST_VIEW,
                    [VIZ_VIEW]: VIZ_VIEW,
                },
                showTabs: true,
            };
        }
        return {
            tabs: {
                [LIST_VIEW]: LIST_VIEW,
            },
            showTabs: false,
        };
    })


    tabRendererParams = key => ({
        view: key,
    });

    startEntriesRequest = () => {
        const { successFramework, successGeoOptions } = this.state;
        if (successFramework && successGeoOptions) {
            this.entriesRequest.init();
            this.entriesRequest.start();
        }
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

    handleHashChange = (view) => {
        this.setState({ view });
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
        const isFilterEmpty = doesObjectHaveNoData(entriesFilters, ['']);

        if (!isFilterEmpty) {
            return (
                <Message
                    className={styles.emptyFilterMessage}
                >
                    <img
                        className={styles.image}
                        src={noFilter}
                        alt=""
                    />
                    <span>{ _ts('entries', 'emptyEntriesForFilterMessage') }</span>
                </Message>
            );
        }
        return (
            <Message
                className={styles.emptyMessage}
            >
                <img
                    className={styles.image}
                    src={noSearch}
                    alt=""
                />
                <span>{ _ts('entries', 'emptyEntriesMessage') }</span>
                <Link
                    className={styles.emptyLinkMessage}
                    to={reverseRoute(pathNames.leads, { projectId })}
                >
                    { _ts('entries', 'emptyEntriesLinkMessage') }
                </Link>
            </Message>
        );
    }

    renderListView = () => {
        const {
            leadGroupedEntriesList,
        } = this.props;
        const {
            pendingGeoOptions,
            pendingEntries,
            pendingFramework,
        } = this.state;

        const blockedLoading = pendingGeoOptions || pendingFramework;
        const nonBlockedLoading = pendingEntries;

        // FIXME: loading animation is messed up

        return (
            <React.Fragment>
                { (blockedLoading || nonBlockedLoading) &&
                    <LoadingAnimation />
                }
                { !blockedLoading && (
                    leadGroupedEntriesList.length > 0 ? (
                        <List
                            className={styles.leadGroupedEntriesList}
                            data={leadGroupedEntriesList}
                            renderer={LeadGroupedEntries}
                            keySelector={leadKeySelector}
                            rendererParams={this.rendererParams}
                        />
                    ) : this.renderEmptyEntriesMessage()
                )}
            </React.Fragment>
        );
    }

    render() {
        const {
            framework,
            activePage,
            totalEntriesCount,
            geoOptions,
        } = this.props;

        const {
            pendingFramework,
            view,
        } = this.state;

        const {
            tabs,
            showTabs,
        } = this.getTabs(framework);

        return (
            <Page
                className={styles.entriesView}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        {
                            view === LIST_VIEW &&
                                <FilterEntriesForm
                                    className={styles.filters}
                                    pending={pendingFramework}
                                    filters={framework.filters}
                                    geoOptions={geoOptions}
                                />
                        }
                        <ScrollTabs
                            className={_cs(styles.tabs, !showTabs && styles.hideTabs)}
                            tabs={tabs}
                            useHash
                            replaceHistory
                            renderer={Tab}
                            blankClassName={styles.blank}
                            onHashChange={this.handleHashChange}
                            activeClassName={styles.activeTab}
                            rendererParams={this.tabRendererParams}
                            defaultHash={LIST_VIEW}
                        />
                    </React.Fragment>
                }
                mainContentClassName={styles.leadGroupedEntriesList}
                mainContent={
                    <MultiViewContainer
                        views={this.views}
                        useHash
                        containerClassName={styles.container}
                    />
                }
                footerClassName={styles.footer}
                footer={
                    totalEntriesCount > 0 && view === LIST_VIEW &&
                    <Pager
                        activePage={activePage}
                        itemsCount={totalEntriesCount}
                        maxItemsPerPage={MAX_ENTRIES_PER_REQUEST}
                        onPageClick={this.handlePageClick}
                        showItemsPerPageChange={false}
                    />
                }
            />
        );
    }
}
