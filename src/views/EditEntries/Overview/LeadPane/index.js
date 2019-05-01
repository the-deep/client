import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import {
    activeProjectRoleSelector,
    editEntriesLeadSelector,
    editEntriesEntriesSelector,
    editEntriesFilteredEntriesSelector,
    editEntriesStatusesSelector,
    editEntriesSelectedEntryKeySelector,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
    // editEntriesTabularDataSelector,
} from '#redux';
import _ts from '#ts';

import LeftPanel from '#components/leftpanel';

import EntriesList from './EntriesList';

const propTypes = {
    projectRole: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onExcerptCreate: PropTypes.func.isRequired,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    filteredEntries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    setSelectedEntryKey: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    tabularFields: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    projectRole: {},
    entries: [],
    filteredEntries: [],
    statuses: {},
    selectedEntryKey: undefined,
};

const mapStateToProps = state => ({
    projectRole: activeProjectRoleSelector(state),
    lead: editEntriesLeadSelector(state),
    entries: editEntriesEntriesSelector(state),
    filteredEntries: editEntriesFilteredEntriesSelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    statuses: editEntriesStatusesSelector(state),
    // tabularData: editEntriesTabularDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class LeftPane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getViews = className => ({
        'entries-listing': {
            component: EntriesList,
            rendererParams: () => {
                const {
                    lead: {
                        id: leadId,
                    },
                    entries,
                    statuses,
                    selectedEntryKey,
                    setSelectedEntryKey,
                    markAsDeletedEntry,
                    tabularFields,
                } = this.props;

                return {
                    className,
                    entries,
                    leadId,
                    statuses,
                    selectedEntryKey,
                    setSelectedEntryKey,
                    markAsDeletedEntry,
                    tabularFields,
                };
            },
            mount: true,
            lazyMount: true,
            wrapContainer: true,
        },
    })

    getTabs = memoize(tabs => ({
        ...tabs,
        'entries-listing': _ts('editEntry.overview.leftpane', 'entriesTabLabel'),
    }))

    render() {
        const {
            projectRole,
            lead,
            onExcerptCreate,
            filteredEntries,
            setSelectedEntryKey,
        } = this.props;

        return (
            <LeftPanel
                projectRole={projectRole}
                lead={lead}
                filteredEntries={filteredEntries}
                setSelectedEntryKey={setSelectedEntryKey}
                viewsModifier={this.getViews}
                tabsModifier={this.getTabs}

                onExcerptCreate={onExcerptCreate}
            />
        );
    }
}
