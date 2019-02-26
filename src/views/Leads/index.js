import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import Page from '#rscv/Page';
import Message from '#rscv/Message';
import AccentButton from '#rsca/Button/AccentButton';
import Button from '#rsca/Button';
import FormattedDate from '#rscv/FormattedDate';
import SelectInput from '#rsci/SelectInput';
import Pager from '#rscv/Pager';
import {
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';
import modalize from '#rscg/Modalize';

import Cloak from '#components/general/Cloak';
import MultiViewContainer from '#rscv/MultiViewContainer';
import FixedTabs from '#rscv/FixedTabs';
import {
    iconNames,
    pathNames,
    viewsAcl,
} from '#constants';
import { leadTypeIconMap } from '#entities/lead';
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
import _ts from '#ts';
import noSearch from '#resources/img/no-search.png';
import noFilter from '#resources/img/no-filter.png';

import ActionButtons from './ActionButtons';
import LeadPreview from './LeadPreview';
import FilterLeadsForm from './FilterLeadsForm';

import DeleteLeadRequest from './requests/DeleteLeadRequest';
import LeadsRequest from './requests/LeadsRequest';
import PatchLeadRequest from './requests/PatchLeadRequest';

import Table from './Table';
import Grid from './Grid';

import styles from './styles.scss';

const AccentModalButton = modalize(AccentButton);

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

const TABLE_VIEW = 'table';
const GRID_VIEW = 'grid';

const tabsIcons = {
    [TABLE_VIEW]: iconNames.list,
    [GRID_VIEW]: iconNames.grid,
};

@connect(mapStateToProps, mapDispatchToProps)
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadKeyExtractor = lead => String(lead.id)
    static sortKeySelector = s => s.key
    static sortLabelSelector = s => s.label

    static tabsModifier = key => (
        <i className={tabsIcons[key]} />
    );

    static tabs = {
        [TABLE_VIEW]: TABLE_VIEW,
        [GRID_VIEW]: GRID_VIEW,
    };

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'attachment_mime_type',
                label: _ts('leads', 'filterSourceType'),
                order: 1,
                sortable: false,
                modifier: (row) => {
                    const MimeType = this.renderMimeType;
                    return (
                        <MimeType row={row} />
                    );
                },
            },
            {
                key: 'title',
                label: _ts('leads', 'titleLabel'),
                order: 2,
                sortable: true,
            },
            {
                key: 'source',
                label: _ts('leads', 'tableHeaderPublisher'),
                order: 3,
                sortable: true,
            },
            {
                key: 'published_on',
                label: _ts('leads', 'tableHeaderDatePublished'),
                order: 4,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.publishedOn}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                label: _ts('leads', 'tableHeaderOwner'),
                order: 5,
                sortable: true,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        className="created-by-link"
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'assignee',
                label: _ts('leads', 'assignee'),
                order: 6,
                sortable: true,
                modifier: ({ assignee, assigneeDetails }) => (
                    assignee ? (
                        <Link
                            key={assignee}
                            className="assignee-link"
                            to={reverseRoute(pathNames.userProfile, { userId: assignee })}
                        >
                            {assigneeDetails.displayName}
                        </Link>
                    ) : null
                ),
            },
            {
                key: 'created_at',
                label: _ts('leads', 'tableHeaderDateCreated'),
                order: 7,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'confidentiality',
                label: _ts('leads', 'tableHeaderConfidentiality'),
                sortable: true,
                order: 8,
                modifier: row => (
                    <div className="confidentiality">
                        {row.confidentiality}
                    </div>
                ),
            },
            {
                key: 'status',
                label: _ts('leads', 'tableHeaderStatus'),
                sortable: true,
                order: 9,
                modifier: row => (
                    <div className="status">
                        {row.status}
                    </div>
                ),
            },
            {
                key: 'no_of_entries',
                label: _ts('leads', 'tableHeaderNoOfEntries'),
                order: 10,
                sortable: true,
                modifier: row => row.noOfEntries,
            },
            {
                key: 'actions',
                label: _ts('leads', 'tableHeaderActions'),
                order: 11,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        onSearchSimilarLead={this.handleSearchSimilarLead}

                        onRemoveLead={this.handleLeadDelete}
                        onMarkProcessed={this.handleMarkAsProcessed}
                        onMarkPending={this.handleMarkAsPending}

                        activeProject={this.props.activeProject}
                    />
                ),
            },
        ];

        this.sortableHeaders = this.headers.filter(h => h.sortable);

        this.state = {
            loadingLeads: true,
            redirectTo: undefined,
        };

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

        this.lastFilters = {};
        this.lastProject = {};
    }

    componentWillMount() {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
            leadsPerPage,
        } = this.props;

        const request = new LeadsRequest({
            setState: params => this.setState(params),
            setLeads: this.props.setLeads,
        });

        this.leadRequest = request.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            leadsPerPage,
        });
        this.leadRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
            leadsPerPage,
            view,
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
            this.leadRequest.stop();

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

            const request = new LeadsRequest({
                setState: params => this.setState(params),
                setLeads,
            });

            this.leadRequest = request.create({
                activeProject,
                activePage,
                activeSort,
                filters,
                leadsPerPage,
            });
            this.leadRequest.start();

            this.lastFilters[view] = filters;
            this.lastProject[view] = activeProject;
        }
    }

    componentWillUnmount() {
        this.leadRequest.stop();

        if (this.leadDeleteRequest) {
            this.leadDeleteRequest.stop();
        }
    }

    // UI

    onGridEndReached = () => {
        const { activePage, leadsPerPage, totalLeadsCount } = this.props;
        if (activePage < Math.ceil(totalLeadsCount / leadsPerPage)) {
            this.props.setLeadPageActivePage({ activePage: activePage + 1 });
        }
    }

    getSortDetails = () => {
        const { activeSort } = this.props;
        let sortDirIcon = iconNames.chevronUp;
        let sortKey = activeSort;

        if (!activeSort) {
            sortDirIcon = iconNames.chevronUp;
            sortKey = '';
        } else if (activeSort[0] === '-') {
            sortDirIcon = iconNames.chevronDown;
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

    handlePageClick = (page) => {
        this.props.setLeadPageActivePage({ activePage: page });
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
    }

    renderMimeType = ({ row }) => {
        const {
            attachment,
            url: rowUrl,
            tabularBook,
        } = row;

        const icon = (tabularBook && iconNames.table)
            || (attachment && leadTypeIconMap[attachment.mimeType])
            || (rowUrl && iconNames.globe)
            || iconNames.documentText;

        const url = (attachment && attachment.file) || rowUrl;
        return (
            <div className="icon-wrapper">
                { url ? (
                    <AccentModalButton
                        iconName={icon}
                        transparent
                        modal={<LeadPreview value={row} />}
                    />
                ) : (
                    <span className={icon} />
                )}
            </div>
        );
    }

    renderHeader = () => {
        const addLeadLink = reverseRoute(
            pathNames.addLeads,
            { projectId: this.props.activeProject },
        );

        return (
            <React.Fragment>
                <FilterLeadsForm className={styles.filters} />
                <FixedTabs
                    tabs={Leads.tabs}
                    useHash
                    replaceHistory
                    className={styles.tabs}
                    modifier={Leads.tabsModifier}
                    onClick={this.handleTabClick}
                    defaultHash={this.props.view}
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
            </React.Fragment>
        );
    }

    renderFooter = () => {
        const {
            activeProject,
            totalLeadsCount,
            activePage,
            leadsPerPage,
        } = this.props;

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

        return (
            <React.Fragment>
                <div className={styles.linkContainer}>
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
                        {...viewsAcl.clusterViz}
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
                { this.props.view === TABLE_VIEW ?
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
                        </div>
                    ) : (
                        <div className={styles.sortingContainer}>
                            <p>{_ts('leadsGrid', 'leadsRange', { leadsCount, totalLeadsCount })}</p>
                            <p>{_ts('leadsGrid', 'sortedByLabel')}:</p>
                            <SelectInput
                                faramElementName="assignee"
                                keySelector={this.sortKeySelector}
                                labelSelector={this.sortLabelSelector}
                                value={sortKey}
                                options={this.sortableHeaders}
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
            </React.Fragment>
        );
    }

    renderEmpty = () => {
        const { loadingLeads } = this.state;

        const isFilterEmpty = doesObjectHaveNoData(this.props.filters, ['']);

        if (loadingLeads && isFilterEmpty) {
            return null;
        }

        if (!isFilterEmpty) {
            return (
                <Message className={styles.emptyFilterMessage}>
                    <img
                        className={styles.image}
                        src={noFilter}
                        alt=""
                    />
                    <div className={styles.text}>
                        {_ts('leads', 'emptyWithFilterMessage')}
                    </div>
                </Message>
            );
        }

        return (
            <Message className={styles.emptyMessage}>
                <img
                    className={styles.image}
                    src={noSearch}
                    alt=""
                />
                <div className={styles.text}>
                    {_ts('leads', 'emptyMessage', {
                        addLeadButtonLabel: (
                            <strong>
                                {_ts('leads', 'addSourcesButtonLabel')}
                            </strong>
                        ),
                    })}
                </div>
            </Message>
        );
    }

    renderTableView = () => (
        <Table
            headers={this.headers}
            activeSort={this.props.activeSort}
            onHeaderClick={this.handleTableHeaderClick}
            loading={this.state.loadingLeads}
            setLeadPageActiveSort={this.props.setLeadPageActiveSort}
            emptyComponent={this.renderEmpty}
        />
    )

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
            activeProject={this.props.activeProject}
            emptyComponent={this.renderEmpty}
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
