import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';

import {
    // editEntriesLeadSelector,
    editEntriesFilteredEntriesSelector,
    // editEntriesStatusesSelector,
    fieldsMapForTabularBookSelector,
} from '#redux';


import { entryAccessor } from '#entities/editEntries';
import _cs from '#cs';


import EntryItem from './EntryItem';
// import EntryItem from '../../../Overview/LeftPane/EntriesList/EntryItem';
import styles from './styles.scss';

const propTypes = {
    // statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    className: PropTypes.string,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    // statuses: {},
    entries: [],
    className: '',
    tabularFields: {},
};

const mapStateToProps = (state, props) => ({
    // lead: editEntriesLeadSelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
    // statuses: editEntriesStatusesSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),
});

@connect(mapStateToProps)
export default class EntriesList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, entry) => {
        const {
            tabularFields,
            /*
            statuses,
            lead: {
                id: leadId,
            },
            */
        } = this.props;

        const currentEntryKey = entryAccessor.key(entry);
        const currentEntryServerId = entryAccessor.serverId(entry);


        /*
        const status = statuses[currentEntryKey];
        const pending = (status === ENTRY_STATUS.requesting);
        */
        const entryData = entryAccessor.data(entry);

        const {
            entryType,
            image,
            excerpt,
            order,
            tabularField: tabularFieldId,
        } = entryData;

        const tabularField = tabularFields[tabularFieldId];

        return {
            entryKey: currentEntryKey,
            entryId: currentEntryServerId,
            entryType,
            image,
            excerpt,
            order,
            tabularField,
            tabularFieldId,
        };
    }

    render() {
        const {
            className,
            entries,
        } = this.props;

        return (
            <ListView
                className={_cs(styles.entriesList, className)}
                keySelector={entryAccessor.key}
                rendererParams={this.rendererParams}
                renderer={EntryItem}
                data={entries}
            />
        );
    }
}
