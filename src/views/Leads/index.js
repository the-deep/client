import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Link,
    Redirect,
} from 'react-router-dom';

import FormattedDate from '#rscv/FormattedDate';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import RawTable from '#rscv/RawTable';
import TableHeader from '#rscv/TableHeader';
import { reverseRoute } from '#rsu/common';

import Cloak from '#components/Cloak';
import { iconNames, pathNames } from '#constants/';
import { leadTypeIconMap } from '#entities/lead';
import {
    activeProjectIdFromStateSelector,
    leadsForProjectSelector,
    totalLeadsCountForProjectSelector,

    setLeadsAction,

    leadPageFilterSelector,
    setLeadPageFilterAction,

    leadPageActiveSortSelector,
    setLeadPageActiveSortAction,

    leadPageActivePageSelector,
    setLeadPageActivePageAction,

    leadPageLeadsPerPageSelector,
    setLeadPageLeadsPerPageAction,

    removeLeadAction,
    patchLeadAction,
} from '#redux';
import _ts from '#ts';

import ActionButtons from './ActionButtons';
import FilterLeadsForm from './FilterLeadsForm';

import DeleteLeadRequest from './requests/DeleteLeadRequest';
import LeadsRequest from './requests/LeadsRequest';
import PatchLeadRequest from './requests/PatchLeadRequest';

import styles from './styles.scss';

const propTypes = {
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    leadsPerPage: PropTypes.number.isRequired,
    setLeads: PropTypes.func.isRequired,
    removeLead: PropTypes.func.isRequired,
    patchLead: PropTypes.func.isRequired,

    totalLeadsCount: PropTypes.number,
    setLeadPageFilter: PropTypes.func.isRequired,
    setLeadPageActiveSort: PropTypes.func.isRequired,
    setLeadPageActivePage: PropTypes.func.isRequired,
    setLeadsPerPage: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectIdFromStateSelector(state),

    leads: leadsForProjectSelector(state),
    totalLeadsCount: totalLeadsCountForProjectSelector(state),
    activePage: leadPageActivePageSelector(state),
    activeSort: leadPageActiveSortSelector(state),
    leadsPerPage: leadPageLeadsPerPageSelector(state),
    filters: leadPageFilterSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeads: params => dispatch(setLeadsAction(params)),
    removeLead: params => dispatch(removeLeadAction(params)),
    patchLead: params => dispatch(patchLeadAction(params)),

    setLeadPageActivePage: params => dispatch(setLeadPageActivePageAction(params)),
    setLeadPageActiveSort: params => dispatch(setLeadPageActiveSortAction(params)),
    setLeadPageFilter: params => dispatch(setLeadPageFilterAction(params)),
    setLeadsPerPage: params => dispatch(setLeadPageLeadsPerPageAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Leads extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadKeyExtractor = lead => String(lead.id)

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'attachmentMimeType',
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
                        className={styles.createdByLink}
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
                modifier: ({ assigneeDetails: person }) => (
                    <Link
                        key={person.id}
                        className={styles.assigneeLink}
                        to={reverseRoute(pathNames.userProfile, { userId: person.id })}
                    >
                        {person.displayName}
                    </Link>
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
                    <div className={styles.confidentiality}>
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
                    <div className={styles.status}>
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

        this.state = {
            loadingLeads: false,
            redirectTo: undefined,
        };
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
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage ||
            this.props.leadsPerPage !== leadsPerPage
        ) {
            this.leadRequest.stop();

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
    }

    componentWillUnmount() {
        this.leadRequest.stop();

        if (this.leadDeleteRequest) {
            this.leadDeleteRequest.stop();
        }
    }

    // UI

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

    // TABLE

    leadModifier = (lead, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(lead);
        }
        return lead[columnKey];
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setLeadPageActiveSort({ activeSort });
    }

    renderMimeType = ({ row }) => {
        let icon = iconNames.documentText;
        let url;
        if (row.attachment) {
            icon = leadTypeIconMap[row.attachment.mimeType];
            url = row.attachment.file;
        } else if (row.url) {
            icon = iconNames.globe;
            url = row.url;
        }
        if (!url) {
            return (
                <div className={styles.iconWrapper}>
                    <i className={icon} />
                </div>
            );
        }
        return (
            <div className={styles.iconWrapper}>
                <a href={url} target="_blank">
                    <i className={icon} />
                </a>
            </div>
        );
    }

    renderHeader = () => {
        const addLeadLink = reverseRoute(
            pathNames.addLeads,
            { projectId: this.props.activeProject },
        );

        return (
            <header className={styles.header}>
                <FilterLeadsForm className={styles.filters} />
                <Cloak
                    hide={({ leadPermissions }) => !leadPermissions.create}
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
            </header>
        );
    }

    renderFooter = () => {
        const {
            activeProject,
            totalLeadsCount,
            activePage,
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

        return (
            <footer className={styles.footer}>
                <div className={styles.linkContainer}>
                    <Link
                        className={styles.link}
                        to={showVisualizationLink}
                    >
                        {_ts('leads', 'showViz')}
                    </Link>
                    <Cloak
                        hide={({ isBeta }) => isBeta}
                        render={
                            <Link
                                className={styles.link}
                                to={showClusterVisualizationLink}
                                replace
                            >
                                {_ts('leads', 'showCluster')}
                            </Link>
                        }
                    />
                    <Cloak
                        hide={({ hasAssessmentTemplate }) => !hasAssessmentTemplate}
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
            </footer>
        );
    }

    render() {
        const {
            loadingLeads,
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
            <div className={styles.leads}>
                <Header />
                <div className={styles.tableContainer}>
                    <div className={styles.scrollWrapper}>
                        <RawTable
                            data={this.props.leads}
                            dataModifier={this.leadModifier}
                            headerModifier={this.headerModifier}
                            headers={this.headers}
                            onHeaderClick={this.handleTableHeaderClick}
                            keySelector={Leads.leadKeyExtractor}
                            className={styles.leadsTable}
                        />
                        { loadingLeads && <LoadingAnimation large /> }
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}
