import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { isFalsy, reverseRoute } from '#rs/utils/common';
import { FgRestBuilder } from '#rs/utils/rest';
import FormattedDate from '#rs/components/View/FormattedDate';
import GridLayout from '#rs/components/View/GridLayout';
import ListView from '#rs/components/View/List/ListView';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Pager from '#rs/components/View/Pager';
import BoundError from '#rs/components/General/BoundError';

import AppError from '#components/AppError';
import {
    iconNames,
    pathNames,
} from '#constants';
import {
    setEntriesAction,
    setProjectAction,
    entriesForProjectSelector,
    entriesViewFilterSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
    unsetEntriesViewFilterAction,

    // Here
    // gridItemsForProjectSelector,
    // maxHeightForProjectSelector,
    // widgetsSelector,

    projectIdFromRouteSelector,

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,
} from '#redux';
import {
    createUrlForFilteredEntries,

    createParamsForGet,
    createParamsForFilteredEntries,
    createUrlForAnalysisFramework,
    createUrlForProject,

    transformResponseErrorToFormError,
} from '#rest';
import _ts from '#ts';
import schema from '#schema';
import notify from '#notify';
import widgetStore from '#widgets';

import FilterEntriesForm from './FilterEntriesForm';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    entries: entriesForProjectSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    entriesFilter: entriesViewFilterSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    activePage: entriesViewActivePageSelector(state, props),
    totalEntriesCount: totalEntriesCountForProjectSelector(state, props),

    /*
    gridItems: gridItemsForProjectSelector(state, props),
    widgets: widgetsSelector(state, props),
    maxHeight: maxHeightForProjectSelector(state, props),
    */
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
    setEntriesViewActivePage: params => dispatch(setEntriesViewActivePageAction(params)),
});

const propTypes = {
    activePage: PropTypes.number.isRequired,
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setEntries: PropTypes.func.isRequired,
    entriesFilter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unsetEntriesViewFilter: PropTypes.func.isRequired,
    totalEntriesCount: PropTypes.number,
    setEntriesViewActivePage: PropTypes.func.isRequired,

    /*
    gridItems: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    maxHeight: PropTypes.number,
    */
};

const defaultProps = {
    // maxHeight: 0,
    totalEntriesCount: 0,
};

const MAX_ENTRIES_PER_REQUEST = 5;
const emptyList = [];

const widgetsFromStore = widgetStore
    .filter(widget => widget.view.listComponent)
    .map(widget => ({
        id: widget.id,
        title: widget.title,
        listComponent: widget.view.listComponent,
    }));

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Entries extends React.PureComponent {
    static leadKeyExtractor = d => d.id;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcualteItems = (analysisFramework) => {
        if (!analysisFramework.widgets) {
            return emptyList;
        }
        return analysisFramework.widgets
            .filter(w => widgetsFromStore.find(ws => ws.id === w.widgetId));
    }

    static calculateMaxHeight = items => (
        items.reduce(
            (acc, item) => {
                const { height, top } = item.properties.listGridLayout;
                return Math.max(acc, height + top + 4);
            },
            0,
        )
    )

    static calculateFilters = (analysisFramework, items) => {
        if (!analysisFramework.filters) {
            return emptyList;
        }
        return analysisFramework.filters
            .filter(f => items.find(item => item.key === f.widgetKey));
    }

    static getAttribute = (attributes = [], widgetId) => {
        const attribute = attributes.find(attr => attr.widget === widgetId);
        return attribute ? attribute.data : undefined;
    };

    static getMiniEntry = entry => ({
        id: entry.id,
        excerpt: entry.excerpt,
        image: entry.image,
        entryType: entry.entryType,
    });

    static calculateGridItems = (entries, items) => {
        const gridItems = {};
        entries.forEach((entryGroup) => {
            entryGroup.entries.forEach((entry) => {
                gridItems[entry.id] = items.map(
                    item => ({
                        key: item.key,
                        widgetId: item.widgetId,
                        title: item.title,
                        layout: item.properties.listGridLayout,
                        attribute: Entries.getAttribute(entry.attributes, item.id),
                        entry: Entries.getMiniEntry(entry),
                        data: item.properties.data,
                    }),
                );
            });
        });
        return gridItems;
    }

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
            pendingAf: true,
        };

        this.leadEntries = React.createRef();

        this.items = Entries.calcualteItems(this.props.analysisFramework);
        this.maxHeight = Entries.calcualteItems(this.props.analysisFramework, this.items);
        this.filters = Entries.calculateFilters(this.props.analysisFramework, this.items);
        this.gridItems = Entries.calculateGridItems(this.props.entries, this.items);
    }

    componentWillMount() {
        const { projectId } = this.props;
        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: oldProjectId,
            analysisFramework: oldAf,
            entriesFilter: oldFilter,
            activePage: oldActivePage,
            entries: oldEntries,
        } = this.props;
        const {
            projectId: newProjectId,
            analysisFramework: newAf,
            entriesFilter: newFilter,
            activePage: newActivePage,
            entries: newEntries,
        } = nextProps;

        if (oldProjectId !== newProjectId) {
            // NOTE: If projects is changed; af, filter and entries will also changed
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }

            this.setState({
                pendingEntries: true,
                pendingAf: true,
            });

            this.projectRequest = this.createRequestForProject(newProjectId);
            this.projectRequest.start();
            return;
        }

        if (oldAf !== newAf) {
            this.items = Entries.calcualteItems(newAf);
            this.maxHeight = Entries.calcualteItems(newAf, this.items);
            this.filters = Entries.calculateFilters(newAf, this.items);
        }
        if (oldAf !== newAf || newEntries !== oldEntries) {
            this.gridItems = Entries.calculateGridItems(newEntries, this.items);
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }

        if (oldFilter !== newFilter || oldActivePage !== newActivePage) {
            // Make request for new entries after filter has changed
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            this.entriesRequest = this.createRequestForEntries(
                newProjectId,
                newFilter,
                newActivePage,
            );
            this.entriesRequest.start();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);

        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    getAttribute = (attributes, widgetId) => {
        const attribute = (
            attributes &&
            attributes.find(attr => attr.widget === widgetId)
        );

        return attribute && attribute.data;
    }

    createRequestForEntries = (projectId, filters = {}, activePage) => {
        const entriesRequestOffset = (activePage - 1) * MAX_ENTRIES_PER_REQUEST;
        const entriesRequestLimit = MAX_ENTRIES_PER_REQUEST;

        const entryRequest = new FgRestBuilder()
            .url(createUrlForFilteredEntries({
                offset: entriesRequestOffset,
                limit: entriesRequestLimit,
            }))
            .params(() => createParamsForFilteredEntries({
                project: projectId,
                ...filters,
            }))
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .postLoad(() => {
                this.setState({ pendingEntries: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    const responseEntries = response.results.entries;
                    const responseLeads = response.results.leads;

                    const entries = responseLeads.map(lead => ({
                        ...lead,
                        entries: responseEntries.filter(e => e.lead === lead.id),
                    }));

                    this.props.setEntries({
                        projectId,
                        entries,
                        totalEntriesCount: response.count,
                    });
                    this.setState({ pristine: true });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: _ts('entries', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('entries', 'entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load entries', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return entryRequest;
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(createParamsForGet)
            .preLoad(() => {
                this.setState({
                    pendingAf: true,
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({ project: response });

                    if (isFalsy(response.analysisFramework)) {
                        console.warn('There is no analysis framework');
                        this.setState({
                            pendingAf: false,
                            pendingEntries: false,
                        });
                    } else {
                        this.analysisFramework = this.createRequestForAnalysisFramework(
                            response.analysisFramework,
                        );
                        this.analysisFramework.start();
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({
                    pendingAf: false,
                    pendingEntries: false,
                });
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: 'Project', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                this.setState({
                    pendingAf: false,
                    pendingEntries: false,
                });
                notify.send({
                    title: 'Project', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load project', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(createParamsForGet)
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({ analysisFramework: response });

                    this.entriesRequest = this.createRequestForEntries(
                        this.props.projectId,
                        this.props.entriesFilter,
                        this.props.activePage,
                    );
                    this.entriesRequest.start();

                    this.setState({ pendingAf: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors)
                    .formErrors
                    .errors
                    .join(' ');
                notify.send({
                    title: 'Analysis Framework', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    pendingAf: false,
                    pendingEntries: false,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Analysis Framework', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load analysis framework', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    pendingAf: false,
                    pendingEntries: false,
                });
            })
            .build();
        return analysisFrameworkRequest;
    }

    handleScroll = (e) => {
        const headers = e.target.getElementsByClassName(styles.header);
        for (let i = 0; i < headers.length; i += 1) {
            headers[i].style.transform = `translateX(${e.target.scrollLeft}px)`;
        }
    }

    handlePageClick = (page) => {
        this.props.setEntriesViewActivePage({ activePage: page });
    }

    renderItemView = (item) => {
        const widget = widgetsFromStore.find(w => w.id === item.widgetId);
        const ListComponent = widget.listComponent;
        return (
            <ListComponent
                data={item.data}
                attribute={item.attribute}
                entry={item.entry}
            />
        );
    }

    renderEntries = (key, data) => (
        <div
            key={data.id}
            className={styles.entry}
            style={{ height: this.maxHeight }}
        >
            <GridLayout
                modifier={this.renderItemView}
                items={this.gridItems[data.id] || emptyList}
                viewOnly
            />
        </div>
    )

    renderLeadGroupedEntriesHeader = ({
        leadId,
        createdAt,
        title,
    }) => {
        const { projectId } = this.props;
        const route = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        });

        return (
            <header className={styles.header}>
                <div className={styles.informationContainer}>
                    <h2 className={styles.heading}>
                        {title}
                    </h2>
                    <div className={styles.detail}>
                        <span className={iconNames.calendar} />
                        <FormattedDate
                            date={createdAt}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                </div>
                <div className={styles.actionButtons}>
                    <Link
                        className={styles.editEntryLink}
                        title={_ts('entries', 'editEntryLinkTitle')}
                        to={route}
                    >
                        {_ts('entries', 'editEntryButtonLabel')}
                    </Link>
                </div>
            </header>
        );
    }

    renderLeadGroupedEntriesItem = (key, data) => {
        const {
            entries = emptyList,
            id,
            title,
            createdAt,
        } = data;

        const LeadGroupedEntriesHeader = this.renderLeadGroupedEntriesHeader;

        return (
            <div
                key={data.id}
                className={styles.leadGroupedEntries}
            >
                <LeadGroupedEntriesHeader
                    leadId={id}
                    title={title}
                    createdAt={createdAt}
                />
                <ListView
                    className={styles.entries}
                    data={entries}
                    modifier={this.renderEntries}
                />
            </div>
        );
    }

    renderFooter = () => {
        const {
            totalEntriesCount,
            activePage,
        } = this.props;

        if (totalEntriesCount <= 0) {
            return null;
        }

        return (
            <footer className={styles.footer}>
                <Pager
                    activePage={activePage}
                    itemsCount={totalEntriesCount}
                    maxItemsPerPage={MAX_ENTRIES_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    renderLeadEntries = () => {
        const { entries = [] } = this.props;
        const {
            pendingEntries,
            pendingAf,
        } = this.state;
        const pending = pendingEntries || pendingAf;
        if (pending) {
            return (
                <LoadingAnimation
                    className={styles.loadingAnimation}
                    large
                />
            );
        }

        return (
            <ListView
                ref={this.leadEntries}
                className={styles.leadEntries}
                data={entries}
                modifier={this.renderLeadGroupedEntriesItem}
            />
        );
    }

    render() {
        const { pendingAf } = this.state;
        const Footer = this.renderFooter;
        const LeadEntries = this.renderLeadEntries;

        return (
            <div className={styles.entriesView}>
                <FilterEntriesForm
                    pending={pendingAf}
                    filters={this.filters}
                />
                <LeadEntries />
                <Footer />
            </div>
        );
    }
}
