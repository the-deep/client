import PropTypes from 'prop-types';
import React from 'react';

import ListView from '#rscv/List/ListView';

import { entryAccessor, ENTRY_STATUS } from '#entities/editEntries';
import _cs from '#cs';

import EntryItem from './EntryItem';
import styles from './styles.scss';

const propTypes = {
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    className: PropTypes.string,
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    selectedEntryKey: undefined,
    statuses: {},
    className: '',
    tabularFields: {},
};

export default class EntriesList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, entry) => {
        const {
            selectedEntryKey,
            tabularFields,
            statuses,
            leadId,
            setSelectedEntryKey,
            markAsDeletedEntry,
        } = this.props;

        const currentEntryKey = entryAccessor.key(entry);
        const currentEntryServerId = entryAccessor.serverId(entry);

        const isActive = currentEntryKey === selectedEntryKey;

        const status = statuses[currentEntryKey];

        const pending = (status === ENTRY_STATUS.requesting);

        const isMarkedAsDeleted = entryAccessor.isMarkedAsDeleted(entry);

        const entryData = entryAccessor.data(entry);

        const imageDetails = entryAccessor.imageDetails(entry);

        const {
            entryType,
            imageRaw,
            image,
            excerpt,
            order,
            tabularField: tabularFieldId,
        } = entryData;

        const tabularField = tabularFields[tabularFieldId];

        return {
            isActive,
            status,
            pending,
            isMarkedAsDeleted,

            entryKey: currentEntryKey,
            entryServerId: currentEntryServerId,
            entryType,
            image,
            imageRaw,
            imageDetails,
            excerpt,
            order,
            tabularField,
            tabularFieldId,

            leadId,
            onSelect: setSelectedEntryKey,
            onMarkAsDelete: markAsDeletedEntry,
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
