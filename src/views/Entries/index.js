import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {
    _cs,
    reverseRoute,
    doesObjectHaveNoData,
} from '@togglecorp/fujs';

import { Link } from 'react-router-dom';
import { pathNames } from '#constants/';
import {
    RequestCoordinator,
    methods,
    RequestClient,
} from '#request';

import Icon from '#rscg/Icon';
import Message from '#rscv/Message';
import List from '#rscv/List';
import LoadingAnimation from '#rscv/LoadingAnimation';
import Pager from '#rscv/Pager';
import Page from '#rscv/Page';
import MultiViewContainer from '#rscv/MultiViewContainer';
import ScrollTabs from '#rscv/ScrollTabs';
import { processEntryFilters } from '#entities/entries';
import { unique } from '#rsu/common';

import notify from '#notify';
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
    activeProjectFromStateSelector,

    setGeoOptionsAction,

    projectIdFromRouteSelector,

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,
    geoOptionsForProjectSelector,
} from '#redux';

import QualityControl from './QualityControl';
import EntriesViz from './EntriesViz';
import FilterEntriesForm from './FilterEntriesForm';
import LeadGroupedEntries from './LeadGroupedEntries';

import styles from './styles.scss';

export const FooterContainer = ({
    parentFooterRef,
    children,
}) => {
    if (!parentFooterRef || !parentFooterRef.current) {
        return null;
    }
    return ReactDOM.createPortal(children, parentFooterRef.current);
};


export const EmptyEntries = ({
    projectId,
    entriesFilters,
    tocFilters,
}) => {
    const isFilterEmpty = doesObjectHaveNoData(entriesFilters, ['']);

    if (!isFilterEmpty || tocFilters?.length > 0) {
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
};

EmptyEntries.propTypes = {
    projectId: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    entriesFilters: PropTypes.object.isRequired,
    // NOTE: Required for QC mode
    tocFilters: PropTypes.arrayOf([PropTypes.string]),
};

EmptyEntries.defaultProps = {
    tocFilters: undefined,
};


const LIST_VIEW = 'list';
const VIZ_VIEW = 'viz';
const QC_VIEW = 'qc';

const tabsIcons = {
    [LIST_VIEW]: 'list',
    [VIZ_VIEW]: 'visualization',
    [QC_VIEW]: 'apps',
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
    currentUserActiveProject: activeProjectFromStateSelector(state),
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
    // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
    entriesFilter: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    framework: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    leadGroupedEntriesList: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    currentUserActiveProject: PropTypes.object.isRequired,
    projectId: PropTypes.number.isRequired,
    totalEntriesCount: PropTypes.number,
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requests: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    setEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setEntriesViewActivePage: PropTypes.func.isRequired,
    setFramework: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    setGeoOptions: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
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

const requestOptions = {
    geoOptionsRequest: {
        url: '/geo-options/',
        query: ({ props }) => ({
            project: props.projectId,
        }),
        onMount: true,
        onPropsChanged: ['projectId'],
        onSuccess: ({ response, props, params }) => {
            const {
                setGeoOptions,
                projectId,
            } = props;

            const {
                onGeoOptionsSuccess,
            } = params;

            setGeoOptions({
                projectId,
                locations: response,
            });

            onGeoOptionsSuccess();
        },
        onFailure: ({ response }) => {
            const message = response.$internal.join(' ');
            notify.send({
                title: _ts('entries', 'entriesTabLabel'),
                type: notify.type.ERROR,
                message,
                duration: notify.duration.MEDIUM,
            });
        },
        onFatal: () => {
            notify.send({
                title: _ts('entries', 'entriesTabLabel'),
                type: notify.type.ERROR,
                message: _ts('entries', 'geoOptionsFatalMessage'),
                duration: notify.duration.MEDIUM,
            });
        },
        extras: {
            schemaName: 'geoOptions',
        },
    },
    projectFrameworkRequest: {
        url: ({ props: { projectId } }) => `/projects/${projectId}/analysis-framework/`,
        onMount: true,
        onPropsChanged: ['projectId'],
        onSuccess: ({ response, props, params }) => {
            const { setFramework } = props;
            const { onFrameworkGetSuccess } = params;

            setFramework({
                analysisFramework: response,
            });

            onFrameworkGetSuccess();
        },
        extras: {
            schemaName: 'analysisFramework',
        },
    },
    entriesRequest: {
        url: '/entries/filter/',
        query: ({ props }) => ({
            offset: (props.activePage - 1) * MAX_ENTRIES_PER_REQUEST,
            limit: MAX_ENTRIES_PER_REQUEST,
        }),
        method: methods.POST,
        body: ({ props }) => {
            const {
                geoOptions,
                framework,
                projectId,
                entriesFilters: widgetFilters,
            } = props;

            const otherFilters = {
                project: projectId,
            };

            const processedFilters = processEntryFilters(
                widgetFilters,
                framework,
                geoOptions,
            );

            return ({
                filters: [
                    ...processedFilters,
                    ...Object.entries(otherFilters),
                ],
            });
        },
        onMount: false,
        onPropsChanged: ['entriesFilter', 'activePage'],
        onSuccess: ({ response, props }) => {
            const {
                setEntries,
                projectId,
            } = props;
            const {
                results: responseEntries,
                count: totalEntriesCount,
            } = response;

            const uniqueLeadList = unique(
                responseEntries.map(entry => entry.lead),
                v => v,
                v => v.id,
            ).map(l => ({
                ...l,
                entries: responseEntries
                    .filter(e => l.id === e.lead.id)
                    .map(e => ({ ...e, lead: e.lead.id })),
            }));

            setEntries({
                projectId,
                entries: uniqueLeadList,
                totalEntriesCount,
            });
        },
        /*
        extras: {
            schemaName: 'entriesGetResponse',
        },
        */
    },
};

@connect(mapStateToProps, mapDispatchToProps)
@RequestCoordinator
@RequestClient(requestOptions)
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            requests: {
                geoOptionsRequest,
                projectFrameworkRequest,
            },
        } = props;

        geoOptionsRequest.setDefaultParams({
            onGeoOptionsSuccess: this.handleGeoOptionsGetSuccess,
        });

        projectFrameworkRequest.setDefaultParams({
            onFrameworkGetSuccess: this.handleFrameworkGetSuccess,
        });

        this.state = {
            successFramework: false,
            successGeoOptions: false,

            view: LIST_VIEW,
        };

        this.views = {
            [LIST_VIEW]: {
                component: this.renderListView,
                wrapContainer: true,
                rendererParams: () => ({
                    parentFooterRef: this.footerRef,
                }),
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
            [QC_VIEW]: {
                component: QualityControl,
                rendererParams: () => ({
                    className: styles.qc,
                    projectId: this.props.projectId,
                    framework: this.props.framework,
                    entriesFilters: this.props.entriesFilters,
                    geoOptions: this.props.geoOptions,
                    maxItemsPerPage: MAX_ENTRIES_PER_REQUEST,
                    parentFooterRef: this.footerRef,
                }),
            },
        };

        this.leadEntries = React.createRef();
        this.footerRef = React.createRef();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillReceiveProps(nextProps) {
        const {
            framework: oldAf,
            projectId: oldProjectId,
        } = this.props;
        const {
            framework: newAf,
            projectId: newProjectId,
        } = nextProps;

        if (oldProjectId !== newProjectId) {
            this.setState({
                successFramework: false,
                successGeoOptions: false,
            });
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    getTabs = memoize((framework, isVisualizationEnabled) => {
        const tabs = {
            [LIST_VIEW]: LIST_VIEW,
            [QC_VIEW]: QC_VIEW,
        };
        if (isVisualizationEnabled && isVisualizationEnabled.entry) {
            tabs[VIZ_VIEW] = VIZ_VIEW;
        }

        return {
            tabs,
            showTabs: Object.keys(tabs).length > 1,
        };
    })

    tabRendererParams = key => ({
        view: key,
    });

    startEntriesRequest = () => {
        const { successFramework, successGeoOptions } = this.state;
        const {
            requests: {
                entriesRequest,
            },
        } = this.props;
        if (successFramework && successGeoOptions) {
            entriesRequest.do();
        }
    }

    handleGeoOptionsGetSuccess = () => {
        this.setState({
            successGeoOptions: true,
        }, this.startEntriesRequest);
    }

    handleFrameworkGetSuccess = () => {
        this.setState({
            successFramework: true,
        }, this.startEntriesRequest);
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
            framework,
        } = this.props;

        return ({
            headerClassName: styles.leadGroupedHeader,
            lead: datum,
            projectId,
            framework,
        });
    }

    renderListView = () => {
        const {
            leadGroupedEntriesList,
            activePage,
            entriesFilters,
            projectId,
            totalEntriesCount,
            requests: {
                geoOptionsRequest: { pending: pendingGeoOptions },
                projectFrameworkRequest: { pending: pendingFramework },
                entriesRequest: { pending: pendingEntries },
            },
        } = this.props;

        const blockedLoading = pendingGeoOptions || pendingFramework;
        const nonBlockedLoading = pendingEntries;

        // FIXME: loading animation is messed up
        return (
            <React.Fragment>
                { (blockedLoading || nonBlockedLoading) &&
                    <LoadingAnimation />
                }
                { !blockedLoading && (
                    leadGroupedEntriesList.length > 0 && totalEntriesCount > 0 ? (
                        <List
                            data={leadGroupedEntriesList}
                            renderer={LeadGroupedEntries}
                            keySelector={leadKeySelector}
                            rendererParams={this.rendererParams}
                        />
                    ) : (
                        <EmptyEntries
                            projectId={projectId}
                            entriesFilters={entriesFilters}
                        />
                    )
                )}
                {totalEntriesCount > 0 && (
                    <FooterContainer parentFooterRef={this.footerRef}>
                        <Pager
                            activePage={activePage}
                            itemsCount={totalEntriesCount}
                            maxItemsPerPage={MAX_ENTRIES_PER_REQUEST}
                            onPageClick={this.handlePageClick}
                            showItemsPerPageChange={false}
                        />
                    </FooterContainer>
                )}
            </React.Fragment>
        );
    }

    render() {
        const {
            framework,
            geoOptions,
            currentUserActiveProject: { isVisualizationEnabled },
            requests: {
                projectFrameworkRequest: { pending: pendingFramework },
            },
        } = this.props;

        const { view } = this.state;

        const {
            tabs,
            showTabs,
        } = this.getTabs(framework, isVisualizationEnabled);

        return (
            <Page
                className={styles.entriesView}
                headerClassName={styles.header}
                header={
                    <React.Fragment>
                        {
                            (view === LIST_VIEW || view === QC_VIEW) &&
                                <FilterEntriesForm
                                    className={styles.filters}
                                    pending={pendingFramework}
                                    widgets={framework.widgets}
                                    filters={framework.filters}
                                    hideMatrixFilters={view === QC_VIEW}
                                    geoOptions={geoOptions}
                                    applyOnChange
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
                mainContentClassName={styles.mainContent}
                mainContent={
                    <MultiViewContainer
                        views={this.views}
                        useHash
                        containerClassName={styles.container}
                    />
                }
                footerClassName={styles.footer}
                footer={<div ref={this.footerRef} />}
            />
        );
    }
}
