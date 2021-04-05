import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';
import { getFiltersForRequest } from '#entities/lead';
import {
    mapToList,
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Page from '#rscv/Page';
import Button from '#rsca/Button';
import SelectInput from '#rsci/SelectInput';
import Pager from '#rscv/Pager';
import {
    RequestCoordinator,
    RequestClient,
    methods,
} from '#request';

import Cloak from '#components/general/Cloak';
import TableEmptyComponent from '#components/viewer/TableEmptyComponent';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import { allLinks } from '#constants/linksAcl';
import {
    activeProjectIdFromStateSelector,
    totalLeadsCountForProjectSelector,

    setLeadsAction,
    appendLeadsAction,

    leadPageFilterSelector,
    setLeadPageFilterAction,

    leadPageActiveSortSelector,
    setLeadPageActiveSortAction,

    leadPageViewSelector,
    setLeadPageViewAction,

    leadPageActivePageSelector,
    setLeadPageActivePageAction,

    leadPageLeadsPerPageSelector,
    setLeadPageLeadsPerPageAction,

    removeLeadAction,
    patchLeadAction,
} from '#redux';
import FilterLeadsForm from '#components/other/FilterLeadsForm';
import _ts from '#ts';
import notify from '#notify';

import DeleteLeadRequest from './requests/DeleteLeadRequest';
import PatchLeadRequest from './requests/PatchLeadRequest';

import Table from './Table';
import Grid from './Grid';
import EmmStatusBar from './EmmStatusBar';

import styles from './styles.scss';

const EmptyComponent = TableEmptyComponent({
    filteredEmptyText: _ts('leads', 'emptyWithFilterMessage'),
    emptyText: _ts('leads', 'emptyMessage', {
        addLeadButtonLabel: (
            <strong>
                {_ts('leads', 'addSourcesButtonLabel')}
            </strong>
        ),
    }),
});

const propTypes = {
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    leadsPerPage: PropTypes.number.isRequired,
    setLeads: PropTypes.func.isRequired,
    appendLeads: PropTypes.func.isRequired,
    removeLead: PropTypes.func.isRequired,
    patchLead: PropTypes.func.isRequired,

    totalLeadsCount: PropTypes.number,
    setLeadPageFilter: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    setLeadPageActivePage: PropTypes.func.isRequired,
    setLeadsPerPage: PropTypes.func.isRequired,
    setLeadPageView: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired,

    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    totalLeadsCount: totalLeadsCountForProjectSelector(state),
    activePage: leadPageActivePageSelector(state),
    activeSort: leadPageActiveSortSelector(state),
    leadsPerPage: leadPageLeadsPerPageSelector(state),
    filters: leadPageFilterSelector(state),
    view: leadPageViewSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    appendLeads: params => dispatch(appendLeadsAction(params)),
    removeLead: params => dispatch(removeLeadAction(params)),
    patchLead: params => dispatch(patchLeadAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageView: params => dispatch(setLeadPageViewAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    setLeadsPerPage: params => dispatch(setLeadPageLeadsPerPageAction(params)),
});

// This map is required for Grid view page, previously all the headers were in this
// page wich doesn't make sense and complicates the process
const tableHeadersMap = {
    multi_select: {
        label: 'select',
        sortable: false,
    },
    attachment_mime_type: {
        label: _ts('leads', 'filterSourceType'),
        sortable: false,
    },
    title: {
        label: _ts('leads', 'titleLabel'),
        sortable: true,
    },
    page_count: {
        label: _ts('leads', 'pageCountTitle'),
        sortable: true,
    },
    source: {
        label: _ts('leads', 'tableHeaderPublisher'),
        sortable: true,
    },
    authors: {
        label: _ts('leads', 'tableHeaderAuthor'),
        sortable: false,
    },
    published_on: {
        label: _ts('leads', 'tableHeaderDatePublished'),
        sortable: true,
    },
    created_by: {
        label: _ts('leads', 'tableHeaderOwner'),
        sortable: true,
    },
    assignee: {
        label: _ts('leads', 'assignee'),
        sortable: true,
    },
    created_at: {
        label: _ts('leads', 'tableHeaderDateCreated'),
        sortable: true,
    },
    confidentiality: {
        label: _ts('leads', 'tableHeaderConfidentiality'),
        sortable: true,
    },
    status: {
        label: _ts('leads', 'tableHeaderStatus'),
        sortable: true,
    },
    entries_count: {
        label: _ts('leads', 'tableHeaderNoOfEntries'),
        sortable: true,
    },
    priority: {
        label: _ts('leads', 'priorityLevel'),
        sortable: true,
    },
    actions: {
        label: _ts('leads', 'tableHeaderActions'),
        sortable: false,
    },
};

const tableHeaders = mapToList(
    tableHeadersMap,
    (data, key) => ({ key, ...data }),
).filter(d => d.sortable);

const TABLE_VIEW = 'table';
const GRID_VIEW = 'grid';

const tabsIcons = {
    [TABLE_VIEW]: 'list',
    [GRID_VIEW]: 'grid',
};

const requestOptions = {
    leadsGetRequest: {
        url: '/v2/leads/filter/',
        method: methods.POST,
        onMount: true,
        query: ({
            props: {
                activePage,
                leadsPerPage,
            },
        }) => ({
            offset: (activePage - 1) * leadsPerPage,
            limit: leadsPerPage,
        }),
        body: ({
            props: {
                activeProject,
                activeSort,
                filters,
            },
        }) => ({
            ordering: activeSort,
            project: [activeProject],
            ...getFiltersForRequest(filters),
        }),
        /*
         * Skipping this for now due to lead grid view
        onPropsChanged: [
            'activeProject',
            'activePage',
            'activeSort',
            'filters',
            'leadsPerPage',
        ], */
        onSuccess: ({
            response,
            props: { setLeads: setLeadsFromProps },
            params: { setLeads: setLeadsFromParams },
        }) => {
            const setLeads = setLeadsFromParams || setLeadsFromProps;

            setLeads({
                leads: response.results,
                totalLeadsCount: response.count,
            });
        },
        onFailure: ({ error: { response } }) => {
            const message = response.errors
                .formErrors
                .errors
                .join(' ');

            notify.send({
                title: _ts('leads', 'leads'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'leadsGetResponse',
        },
    },
};

function IconWrapper(p) {
    const {
        isActive, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
        ...otherProps
    } = p;

    return (
        <Icon
            {...otherProps}
        />
    );
}

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadKeyExtractor = lead => String(lead.id)
    static sortKeySelector = s => s.key
    static sortLabelSelector = s => s.label

    static tabIconRendererParams = key => ({
        name: tabsIcons[key],
    })

    constructor(props) {
        super(props);

        this.state = {
            redirectTo: undefined,
            hasEmmFields: false,
            showGotoTopButton: false,
        };

        this.tableContainerRef = React.createRef();

        this.views = {
            [TABLE_VIEW]: {
                component: this.renderTableView,
                wrapContainer: true,
                mount: true,
                lazyMount: true,
            },

            [GRID_VIEW]: {
                component: this.renderGridView,
                wrapContainer: true,
                mount: true,
                lazyMount: true,
            },
        };

        this.tabs = {
            [TABLE_VIEW]: TABLE_VIEW,
            [GRID_VIEW]: GRID_VIEW,
        };

        this.lastFilters = {};
        this.lastProject = {};
    }

    componentDidMount() {
        window.setTimeout(() => {
            const c = this.tableContainerRef.current;

            if (c) {
                const sw = c.getElementsByClassName('raw-table-scroll-wrapper')[0];

                this.handleRawTableScroll = (e) => {
                    window.clearTimeout(this.scrollTimeout);

                    this.scrollTimeout = window.setTimeout(() => {
                        this.setState({ showGotoTopButton: e.target.scrollTop > 0 });
                    }, 200);
                };

                sw.addEventListener('scroll', this.handleRawTableScroll);
            }
        }, 0);
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
            leadsPerPage,
            view,
            requests: {
                leadsGetRequest,
            },
        } = nextProps;

        if (
            this.lastProject[view] !== activeProject ||
            this.lastFilters[view] !== filters ||
            (
                (
                    this.props.activeSort !== activeSort ||
                    this.props.activePage !== activePage ||
                    this.props.leadsPerPage !== leadsPerPage
                ) &&
                this.props.view === view
            )
        ) {
            // append in case of next page reached in gridview
            const shouldAppend = this.props.view === GRID_VIEW &&
                view === GRID_VIEW &&
                this.props.activeProject === activeProject &&
                this.props.activeSort === activeSort &&
                this.props.filters === filters &&
                this.props.activePage !== activePage &&
                this.props.leadsPerPage === leadsPerPage &&
                activePage !== 1;

            const setLeads = shouldAppend ?
                this.props.appendLeads : this.props.setLeads;

            leadsGetRequest.do({ setLeads });

            this.lastFilters[view] = filters;
            this.lastProject[view] = activeProject;
        }
    }

    componentWillUnmount() {
        if (this.leadDeleteRequest) {
            this.leadDeleteRequest.stop();
        }

        const c = this.tableContainerRef.current;

        if (c) {
            const sw = c.getElementsByClassName('raw-table-scroll-wrapper')[0];
            sw.removeEventListener('scroll', this.handleRawTableScroll);
        }
    }

    onGridEndReached = () => {
        const {
            requests: {
                leadsGetRequest: { pending },
            },
        } = this.props;

        if (pending) {
            return;
        }
        const { activePage, leadsPerPage, totalLeadsCount } = this.props;
        if (activePage < Math.ceil(totalLeadsCount / leadsPerPage)) {
            this.props.setLeadPageActivePage({ activePage: activePage + 1 });
        }
    }

    getSortDetails = () => {
        const { activeSort } = this.props;
        let sortDirIcon = 'chevronUp';
        let sortKey = activeSort;

        if (!activeSort) {
            sortDirIcon = 'chevronUp';
            sortKey = '';
        } else if (activeSort[0] === '-') {
            sortDirIcon = 'chevronDown';
            sortKey = activeSort.slice(1);
        }
        return {
            sortDirIcon,
            sortKey,
        };
    }

    handleSearchSimilarLead = (row) => {
        this.props.setLeadPageFilter({
            filters: {
                ...this.props.filters,
                similar: row.id,
            },
        });
    };

    handleLeadDelete = (selectedLead) => {
        if (this.leadDeleteRequest) {
            this.leadDeleteRequest.stop();
        }
        const request = new DeleteLeadRequest({
            setState: params => this.setState(params),
            removeLead: this.props.removeLead,
        });
        this.leadDeleteRequest = request.create(selectedLead);
        this.leadDeleteRequest.start();
    }

    handleMarkAsPending = (selectedLead) => {
        if (this.leadEditRequest) {
            this.leadEditRequest.stop();
        }
        const request = new PatchLeadRequest({
            setState: params => this.setState(params),
            patchLead: this.props.patchLead,
        });
        this.leadEditRequest = request.create(selectedLead, { status: 'pending' });
        this.leadEditRequest.start();
    }

    handleMarkAsProcessed = (selectedLead) => {
        if (this.leadEditRequest) {
            this.leadEditRequest.stop();
        }
        const request = new PatchLeadRequest({
            setState: params => this.setState(params),
            patchLead: this.props.patchLead,
        });
        this.leadEditRequest = request.create(selectedLead, { status: 'processed' });
        this.leadEditRequest.start();
    }

    handleMarkAsValidated = (selectedLead) => {
        if (this.leadEditRequest) {
            this.leadEditRequest.stop();
        }
        const request = new PatchLeadRequest({
            setState: params => this.setState(params),
            patchLead: this.props.patchLead,
        });
        this.leadEditRequest = request.create(selectedLead, { status: 'validated' });
        this.leadEditRequest.start();
    }

    handlePageClick = (page) => {
        this.props.setLeadPageActivePage({ activePage: page });
    }

    handleLeadsRemoveSuccess = () => {
        const {
            activePage,
            setLeadPageActivePage,
            setLeads,
            requests: {
                leadsGetRequest,
            },
        } = this.props;
        // NOTE: Setting this to first page as if we remove a bunch of leads that
        // might change the total count and current page might be non-existent
        // If we are at the first page, then we only trigger the extraction,
        // if not we set lead page to 1 and it will trigger the extraction
        if (activePage === 1) {
            leadsGetRequest.do({ setLeads });
        } else {
            setLeadPageActivePage({ activePage: 1 });
        }
    }

    handleLeadsPerPageChange = (pageCount) => {
        this.props.setLeadsPerPage({ leadsPerPage: pageCount });
    }

    handleSortOrderClick = () => {
        let { activeSort } = this.props;
        if (!activeSort) {
            return;
        } else if (activeSort[0] === '-') {
            activeSort = activeSort.slice(1);
        } else {
            activeSort = `-${activeSort}`;
        }
        this.props.setLeadPageActiveSort({ activeSort });
    }

    handleSortItemClick = (key) => {
        this.props.setLeadPageActiveSort({ activeSort: key });
    }

    handleTabClick = (view) => {
        this.props.setLeadPageView({ view });

        if (view === 'table') {
            window.setTimeout(() => {
                const c = this.tableContainerRef.current;

                if (c) {
                    const sw = c.getElementsByClassName('raw-table-scroll-wrapper')[0];

                    this.handleRawTableScroll = (e) => {
                        window.clearTimeout(this.scrollTimeout);

                        this.scrollTimeout = window.setTimeout(() => {
                            this.setState({ showGotoTopButton: e.target.scrollTop > 0 });
                        }, 200);
                    };

                    sw.addEventListener('scroll', this.handleRawTableScroll);
                }
            }, 0);
        } else {
            const c = this.tableContainerRef.current;

            if (c) {
                const sw = c.getElementsByClassName('raw-table-scroll-wrapper')[0];
                sw.removeEventListener('scroll', this.handleRawTableScroll);
                // this.setState({ showGotoTopButton: false });
            }
        }
    }

    handleEmmStatusReceive = (hasEmmFields) => {
        this.setState({ hasEmmFields });
    }

    renderHeader = () => {
        const addLeadLink = reverseRoute(
            pathNames.addLeads,
            { projectId: this.props.activeProject },
        );
        const { view } = this.props;

        return (
            <React.Fragment>
                <FilterLeadsForm
                    className={styles.filters}
                    onEmmStatusReceive={this.handleEmmStatusReceive}
                />
                <div className={styles.rightContainer}>
                    <ScrollTabs
                        tabs={this.tabs}
                        useHash
                        replaceHistory
                        className={styles.tabs}
                        renderer={IconWrapper}
                        rendererParams={Leads.tabIconRendererParams}
                        onClick={this.handleTabClick}
                        defaultHash={view}
                    />
                    <Cloak
                        {...viewsAcl.addLeads}
                        render={
                            <Link
                                to={addLeadLink}
                                className={styles.addLeadLink}
                            >
                                {/* TODO: add icon aswell */}
                                {_ts('leads', 'addSourcesButtonLabel')}
                            </Link>
                        }
                    />
                </div>
            </React.Fragment>
        );
    }

    renderFooter = () => {
        const {
            activeProject,
            totalLeadsCount,
            activePage,
            leadsPerPage,
            view,
        } = this.props;

        const { hasEmmFields } = this.state;

        const showVisualizationLink = reverseRoute(
            pathNames.leadsViz,
            { projectId: activeProject },
        );
        const showClusterVisualizationLink = reverseRoute(
            pathNames.clusterViz,
            { projectId: activeProject },
        );

        const showLeadGroupsLink = reverseRoute(
            pathNames.leadGroups,
            { projectId: activeProject },
        );

        const leadsCount = Math.min(activePage * leadsPerPage, totalLeadsCount);

        const { sortDirIcon, sortKey } = this.getSortDetails();

        const handleGotoTopButtonClick = () => {
            const c = this.tableContainerRef.current;
            if (c) {
                const sw = c.getElementsByClassName('raw-table-scroll-wrapper')[0];
                if (sw) {
                    sw.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    });
                }
            }
        };

        return (
            <React.Fragment>
                <div className={styles.leftContainer}>
                    <Cloak
                        {...viewsAcl.leadsViz}
                        render={
                            <Link
                                className={styles.link}
                                to={showVisualizationLink}
                            >
                                {_ts('leads', 'showViz')}
                            </Link>
                        }
                    />
                    <Cloak
                        {...allLinks.clusterViz}
                        render={
                            <Link
                                className={styles.link}
                                to={showClusterVisualizationLink}
                            >
                                {_ts('leads', 'showCluster')}
                            </Link>
                        }
                    />
                    <Cloak
                        {...viewsAcl.leadGroups}
                        requireAssessmentTemplate
                        render={
                            <Link
                                className={styles.link}
                                to={showLeadGroupsLink}
                            >
                                {_ts('leads', 'showLeadGroups')}
                            </Link>
                        }
                    />
                </div>
                <div className={styles.rightContainer}>
                    {hasEmmFields && (
                        <EmmStatusBar />
                    )}
                    {view === TABLE_VIEW ?
                        (
                            <div className={styles.pagerContainer}>
                                <Pager
                                    activePage={activePage}
                                    className={styles.pager}
                                    itemsCount={totalLeadsCount}
                                    maxItemsPerPage={this.props.leadsPerPage}
                                    onPageClick={this.handlePageClick}
                                    onItemsPerPageChange={this.handleLeadsPerPageChange}
                                />
                                { this.state.showGotoTopButton && (
                                    <Button
                                        className={styles.gotoTop}
                                        onClick={handleGotoTopButtonClick}
                                        iconName="chevronUp"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className={styles.sortingContainer}>
                                <div className={styles.text}>{_ts('leadsGrid', 'leadsRange', { leadsCount, totalLeadsCount })}</div>
                                <div className={styles.text}>{_ts('leadsGrid', 'sortedByLabel')}:</div>
                                <SelectInput
                                    faramElementName="assignee"
                                    keySelector={this.sortKeySelector}
                                    labelSelector={this.sortLabelSelector}
                                    showLabel={false}
                                    value={sortKey}
                                    options={tableHeaders}
                                    onChange={this.handleSortItemClick}
                                    placeholder={_ts('leads', 'placeholderAnybody')}
                                    showHintAndError={false}
                                />
                                <Button
                                    tabIndex="-1"
                                    iconName={sortDirIcon}
                                    onClick={this.handleSortOrderClick}
                                    transparent
                                />
                            </div>
                        )
                    }
                </div>
            </React.Fragment>
        );
    }

    renderTableView = () => {
        const {
            activeSort,
            setLeadPageActiveSort,
            activeProject,
            requests: {
                leadsGetRequest: { pending },
            },
            filters,
        } = this.props;
        const isFilterEmpty = doesObjectHaveNoData(filters, ['']);

        return (
            <Table
                headersMap={tableHeadersMap}
                activeSort={activeSort}
                onHeaderClick={this.handleTableHeaderClick}
                loading={pending}
                setLeadPageActiveSort={setLeadPageActiveSort}
                emptyComponent={EmptyComponent}
                isFilterEmpty={isFilterEmpty}
                filters={filters}
                onLeadsRemoveSuccess={this.handleLeadsRemoveSuccess}

                onSearchSimilarLead={this.handleSearchSimilarLead}

                onRemoveLead={this.handleLeadDelete}

                activeProject={activeProject}
                containerRef={this.tableContainerRef}
            />
        );
    }

    renderGridView = () => (
        <Grid
            view={this.props.view}
            loading={this.state.loadingLeads}
            onEndReached={this.onGridEndReached}
            setLeadPageActivePage={this.props.setLeadPageActivePage}
            onSearchSimilarLead={this.handleSearchSimilarLead}
            onRemoveLead={this.handleLeadDelete}
            onMarkProcessed={this.handleMarkAsProcessed}
            onMarkPending={this.handleMarkAsPending}
            onMarkValidated={this.handleMarkAsValidated}
            activeProject={this.props.activeProject}
            emptyComponent={EmptyComponent}
        />
    )

    render() {
        const {
            redirectTo,
        } = this.state;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        return (
            <Page
                className={styles.leads}
                headerClassName={styles.header}
                header={<Header />}
                mainContentClassName={styles.main}
                mainContent={
                    <MultiViewContainer
                        views={this.views}
                        useHash
                        activeClassName={styles.active}
                        containerClassName={styles.container}
                    />
                }
                footerClassName={styles.footer}
                footer={<Footer />}
            />
        );
    }
}
