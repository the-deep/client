import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListView from '#rscv/List/ListView';

import { entryGroupAccessor, ENTRY_STATUS } from '#entities/editEntries';
import _cs from '#cs';

import {
    editEntriesLeadSelector,
    editEntriesEntryGroupsSelector,
    editEntriesEntryGroupStatusesSelector,
    editEntriesMarkAsDeletedEntryGroupAction,
} from '#redux';


import EntryGroupItem from './EntryGroupItem';
import styles from './styles.scss';

const mapStateToProps = state => ({
    lead: editEntriesLeadSelector(state),
    entryGroups: editEntriesEntryGroupsSelector(state),
    statuses: editEntriesEntryGroupStatusesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    markAsDeletedEntryGroup: params => dispatch(editEntriesMarkAsDeletedEntryGroupAction(params)),
});

const propTypes = {
    entryGroups: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    markAsDeletedEntryGroup: PropTypes.func.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    statuses: {},
    className: '',
    lead: {},
};

@connect(mapStateToProps, mapDispatchToProps)
export default class EntryGroupsList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    rendererParams = (key, entryGroup) => {
        const {
            statuses,
            lead: {
                id: leadId,
            },
            markAsDeletedEntryGroup,
        } = this.props;

        const currentEntryGroupKey = entryGroupAccessor.key(entryGroup);
        const currentEntryServerId = entryGroupAccessor.serverId(entryGroup);

        const status = statuses[currentEntryGroupKey];

        const pending = (status === ENTRY_STATUS.requesting);

        const isMarkedAsDeleted = entryGroupAccessor.isMarkedAsDeleted(entryGroup);

        const entryData = entryGroupAccessor.data(entryGroup);

        const {
            title,
            order,
        } = entryData;

        return {
            status,
            pending,
            isMarkedAsDeleted,

            entryGroupKey: currentEntryGroupKey,
            entryGroupServerId: currentEntryServerId,
            title,
            order,

            leadId,
            onMarkAsDelete: markAsDeletedEntryGroup,
        };
    }

    render() {
        const {
            className,
            entryGroups,
        } = this.props;

        return (
            <ListView
                className={_cs(styles.entryGroupsList, className)}
                keySelector={entryGroupAccessor.key}
                rendererParams={this.rendererParams}
                renderer={EntryGroupItem}
                data={entryGroups}
            />
        );
    }
}
