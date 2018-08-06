import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import VirtualizedListView from '#rscv/VirtualizedListView';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesWidgetsSelector,
    editEntriesStatusesSelector,
} from '#redux';

import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';

import {
    widgetVisibility,
    VISIBILITY,
    VIEW,
} from '../../AnalysisFramework/widgets';

import WidgetFaramContainer from './WidgetFaramContainer';
import styles from './styles.scss';

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

const calculateMaxWidgetHeight = (widgets) => {
    if (widgets.length === 0) {
        return 0;
    }

    let maxH = 0;
    widgets.forEach((widget) => {
        const {
            properties: {
                listGridLayout: {
                    top,
                    height,
                },
            } = {},
        } = widget;

        const bottom = top + height;

        if (maxH < bottom) {
            maxH = bottom;
        }
    });

    return maxH;
};

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

        // TODO: Find better solution for height calcuation
        this.viewHeight = calculateMaxWidgetHeight(props.widgets) + 20;
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Listing.filterWidgets(newWidgets, VIEW.list);
            this.viewHeight = calculateMaxWidgetHeight(newWidgets) + 20;
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
                itemHeight={this.viewHeight}
                renderer={WidgetFaramContainer}
                rendererParams={this.rendererParams}
                keyExtractor={this.keySelector}
            />
        );
    }
}
