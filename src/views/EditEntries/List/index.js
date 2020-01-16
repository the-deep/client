import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isDefined } from '@togglecorp/fujs';

import VirtualizedListView from '#rscv/VirtualizedListView';
import Message from '#rscv/Message';
import _ts from '#ts';

import {
    editEntriesFilteredEntriesSelector,
    editEntriesWidgetsSelector,
    fieldsMapForTabularBookSelector,
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
    hash: PropTypes.string,
    leadId: PropTypes.number.isRequired,
};

const defaultProps = {
    entries: [],
    statuses: {},
    widgets: [],
    hash: undefined,
};

const mapStateToProps = (state, props) => ({
    entries: editEntriesFilteredEntriesSelector(state),
    widgets: editEntriesWidgetsSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),
});

@connect(mapStateToProps)
export default class Listing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentDidMount() {
        window.addEventListener('scroll', this.handleScroll, true);
    }

    componentDidUpdate(prevProps) {
        const { hash } = this.props;

        if (isDefined(this.scrollTop) && prevProps.hash !== hash && hash === '#/list') {
            const list = document.getElementsByClassName(styles.list)[0];

            if (list) {
                const scrollContainer = list.getElementsByClassName('virtualized-list-view')[0];

                if (scrollContainer) {
                    const lastScrollTop = this.scrollTop;

                    setTimeout(() => {
                        scrollContainer.scrollTop = lastScrollTop;
                    }, 1000);
                }
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll, true);
    }

    handleScroll = (e) => {
        this.scrollTop = e.target.scrollTop;

        const headers = e.target.getElementsByClassName('widget-container-header');
        for (let i = 0; i < headers.length; i += 1) {
            headers[i].style.transform = `translateX(${e.target.scrollLeft}px)`;
        }
    }

    rendererParams = (key, entry, index) => {
        const {
            statuses,
            tabularFields,
            entryStates,
            schema,
            computeSchema,
            onEntryStateChange,
            analysisFramework,
            lead,
            leadId,
            bookId,
            widgets,
        } = this.props;

        const fieldId = entryAccessor.tabularField(entry);
        const field = tabularFields[fieldId];

        return {
            entry,
            pending: statuses[key] === ENTRY_STATUS.requesting,
            entryState: entryStates[key],
            tabularData: field,
            widgetType: VIEW.list,

            schema,
            computeSchema,
            onEntryStateChange,
            analysisFramework,
            lead,
            leadId,
            widgets,

            index,
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
                keySelector={entryAccessor.key}
                emptyComponent={EmptyComponent}
            />
        );
    }
}
