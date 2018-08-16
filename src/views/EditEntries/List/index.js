import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import VirtualizedListView from '#rscv/VirtualizedListView';
import Message from '#rscv/Message';
import _ts from '#ts';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesWidgetsSelector,
    editEntriesStatusesSelector,
} from '#redux';
import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import {
    widgetVisibility,
    VISIBILITY,
    VIEW,
} from '#widgets';

import WidgetFaramContainer from './WidgetFaramContainer';
import styles from './styles.scss';

const EmptyComponent = () => (
    <Message>
        {_ts('editEntry.list', 'noEntriesText')}
    </Message>
);

const propTypes = {
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    entries: [],
    statuses: {},
    widgets: [],
};

const mapStateToProps = state => ({
    entries: editEntriesFilteredEntriesSelector(state),
    statuses: editEntriesStatusesSelector(state),
    widgets: editEntriesWidgetsSelector(state),
});

@connect(mapStateToProps)
export default class Listing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static filterWidgets = (widgets, widgetType) => widgets.filter(
        w => widgetVisibility(w.widgetId, widgetType, w.properties.addedFrom) !== VISIBILITY.hidden,
    );

    constructor(props) {
        super(props);
        this.widgets = Listing.filterWidgets(props.widgets, VIEW.list);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Listing.filterWidgets(newWidgets, VIEW.list);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    keySelector = entry => entryAccessor.key(entry)

    handleScroll = (e) => {
        const headers = e.target.getElementsByClassName('widget-container-header');
        for (let i = 0; i < headers.length; i += 1) {
            headers[i].style.transform = `translateX(${e.target.scrollLeft}px)`;
        }
    }

    rendererParams = (key, entry) => {
        const {
            entries, // eslint-disable-line
            widgets, // eslint-disable-line
            statuses,
            ...otherProps
        } = this.props;

        return {
            entry,
            pending: statuses[key] === ENTRY_STATUS.requesting,
            widgetType: VIEW.list,
            widgets: this.widgets,
            ...otherProps,
        };
    }

    render() {
        const { entries } = this.props;

        return (
            <VirtualizedListView
                className={styles.list}
                data={entries}
                renderer={WidgetFaramContainer}
                rendererParams={this.rendererParams}
                keyExtractor={this.keySelector}
                emptyComponent={EmptyComponent}
            />
        );
    }
}
