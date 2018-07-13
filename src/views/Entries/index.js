import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';
import BoundError from '#rs/components/General/BoundError';

import AppError from '#components/AppError';
import {
    setEntriesAction,
    setProjectAction,
    entriesForProjectSelector,
    entriesViewFilterSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
    unsetEntriesViewFilterAction,

    setGeoOptionsAction,

    // Here
    // gridItemsForProjectSelector,
    // maxHeightForProjectSelector,
    // widgetsSelector,

    projectIdFromRouteSelector,

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,
} from '#redux';

import EntriesRequest from './requests/EntriesRequest';
import FrameworkRequest from './requests/FrameworkRequest';
import GeoOptionsRequest from './requests/GeoOptionsRequest';
import LeadGroupedEntries from './LeadGroupedEntries';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    leadGroupedEntriesList: entriesForProjectSelector(state, props),
    framework: analysisFrameworkForProjectSelector(state, props),
    entriesFilter: entriesViewFilterSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    activePage: entriesViewActivePageSelector(state, props),
    totalEntriesCount: totalEntriesCountForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setGeoOptions: params => dispatch(setGeoOptionsAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
    setEntriesViewActivePage: params => dispatch(setEntriesViewActivePageAction(params)),
});

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    leadGroupedEntriesList: PropTypes.array.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    framework: PropTypes.object.isRequired,
    projectId: PropTypes.number.isRequired,
    setEntries: PropTypes.func.isRequired,
    setFramework: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    entriesFilter: PropTypes.object.isRequired,
    setGeoOptions: PropTypes.func.isRequired,
};

const defaultProps = {
};

const LeadKeySelector = d => d.id;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
            pendingFramework: true,
        };

        const getProjectId = () => this.props.projectId;
        const getOffset = () => this.props.offset;
        const getLimit = () => this.props.limit;
        const getFilters = () => this.props.entriesFilter;
        const setState = d => this.setState(d);

        this.entriesRequest = new EntriesRequest({
            setState,
            getOffset,
            getLimit,
            getProjectId,
            getFilters,
            setEntries: this.props.setEntries,
        });

        this.geoOptionsRequest = new GeoOptionsRequest({
            setState,
            getProjectId,
            setGeoOptions: this.props.setGeoOptions,
        });

        this.frameworkRequest = new FrameworkRequest({
            setState,
            getProjectId,
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

    componentWillUnmount() {
        this.entriesRequest.stop();
        this.geoOptionsRequest.stop();
        this.frameworkRequest.stop();
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    getLeadGroupedEntriesParams = (_, datum) => {
        const {
            projectId,
            framework: {
                widgets,
            },
        } = this.props;

        return ({
            lead: datum,
            projectId,
            widgets,
        });
    }

    renderHeader = () => {
        const text = 'Header';

        return (
            <header className={styles.header}>
                { text }
            </header>
        );
    }

    renderLeadGroupedEntriesList = () => {
        const { leadGroupedEntriesList } = this.props;

        return (
            <ListView
                className={styles.leadGroupedEntriesList}
                data={leadGroupedEntriesList}
                renderer={LeadGroupedEntries}
                keyExtractor={LeadKeySelector}
                rendererParams={this.getLeadGroupedEntriesParams}
            />
        );
    }

    renderFooter = () => {
        const text = 'Footer';

        return (
            <div className={styles.footer}>
                { text }
            </div>
        );
    }

    render() {
        const Header = this.renderHeader;
        const LeadGroupedEntriesList = this.renderLeadGroupedEntriesList;
        const Footer = this.renderFooter;

        return (
            <div className={styles.entriesView}>
                <Header />
                <LeadGroupedEntriesList />
                <Footer />
            </div>
        );
    }
}
