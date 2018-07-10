import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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

    // Here
    // gridItemsForProjectSelector,
    // maxHeightForProjectSelector,
    // widgetsSelector,

    projectIdFromRouteSelector,

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,
} from '#redux';

import _ts from '#ts';

import EntriesRequest from './requests/EntriesRequest';
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
    // activePage: PropTypes.number.isRequired,
    // entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    setEntries: PropTypes.func.isRequired,
    entriesFilter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    // totalEntriesCount: PropTypes.number,
    // setEntriesViewActivePage: PropTypes.func.isRequired,

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

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: true,
        };

        this.entriesRequest = new EntriesRequest({
            setState: d => this.setState(d),
            getOffset: () => this.props.offset,
            getLimit: () => this.props.limit,
            getFilters: () => this.props.entriesFilter,
            setEntries: this.props.setEntries,
        });

        this.leadEntries = React.createRef();
    }

    componentDidMount() {
        this.entriesRequest.init();
        this.entriesRequest.start();
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillUnmount() {
        this.entriesRequest.stop();
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    renderHeader = () => {
        const text = 'Header';

        return (
            <header className={styles.header}>
                { text }
            </header>
        );
    }

    renderLeadGroupedEntries = () => {
        const text = 'Entries';

        return (
            <div className={styles.leadGroupedEntries}>
                { text }
            </div>
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
        const LeadGroupedEntries = this.renderLeadGroupedEntries;
        const Footer = this.renderFooter;
        // const LeadEntries = this.renderLeadEntries;

        return (
            <div className={styles.entriesView}>
                <Header />
                <LeadGroupedEntries />
                <Footer />
            </div>
        );
    }
}
