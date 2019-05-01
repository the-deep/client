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
    fieldsMapForTabularBookSelector,
    // editEntriesTabularDataSelector,
} from '#redux';
import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import { VIEW } from '#widgets';

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
    // tabularData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    entries: [],
    statuses: {},
    widgets: [],
    // tabularData: {},
};

const mapStateToProps = (state, props) => ({
    entries: editEntriesFilteredEntriesSelector(state),
    statuses: editEntriesStatusesSelector(state),
    widgets: editEntriesWidgetsSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),
    // tabularData: editEntriesTabularDataSelector(state),
});

@connect(mapStateToProps)
export default class Listing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
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
            statuses,
            // tabularData,
            entryStates,

            tabularFields,

            ...otherProps
        } = this.props;

        const fieldId = entryAccessor.tabularField(entry);
        const field = tabularFields[fieldId];

        return {
            entry,
            pending: statuses[key] === ENTRY_STATUS.requesting,
            tabularData: field,
            widgetType: VIEW.list,
            entryState: entryStates[key],
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
                keySelector={this.keySelector}
                emptyComponent={EmptyComponent}
            />
        );
    }
}
