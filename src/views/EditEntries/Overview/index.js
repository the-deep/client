import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ResizableH from '#rscv/Resizable/ResizableH';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';

import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import {
    leadIdFromRoute,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,
    editEntriesStatusesSelector,
    // editEntriesSelectedEntryTabularDataSelector,

    editEntriesSelectedEntryKeySelector,
    editEntriesFilteredEntriesSelector,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
    // editEntriesTabularDataSelector,
    fieldsMapForTabularBookSelector,
} from '#redux';
import { VIEW } from '#widgets';

import _ts from '#ts';
import Cloak from '#components/general/Cloak';

import WidgetFaram from '../WidgetFaram';
import LeadPane from './LeadPane';
import styles from './styles.scss';

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // tabularDataForSelectedEntry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    // tabularData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    // tabularDataForSelectedEntry: undefined,
    // tabularData: {},
    widgets: [],
    entries: [],
    statuses: {},
    selectedEntryKey: undefined,
};


const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state),
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
    // tabularDataForSelectedEntry: editEntriesSelectedEntryTabularDataSelector(state),
    // tabularData: editEntriesTabularDataSelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
    statuses: editEntriesStatusesSelector(state),

    tabularFields: fieldsMapForTabularBookSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static entryKeySelector = entry => entryAccessor.key(entry)

    static shouldHideEntryAdd = ({ entryPermissions }) => !entryPermissions.create

    entryLabelSelector = (entry) => {
        const values = entryAccessor.data(entry);
        const fieldId = entryAccessor.tabularField(entry);
        const { excerpt, order } = values;

        if (excerpt) {
            return excerpt;
        }

        if (fieldId) {
            const field = this.props.tabularFields[fieldId];
            // FIXME: use strings
            return (field && field.title) || `Column ${fieldId}`;
        }

        return _ts('editEntry.overview', 'unnamedExcerptTitle', { index: order });
    };

    shouldHideEntryDelete = ({ entryPermissions }) => (
        !entryPermissions.delete && !!entryAccessor.serverId(this.props.entry)
    )

    handleEntrySelect = (entryKey) => {
        this.props.setSelectedEntryKey({
            leadId: this.props.leadId,
            key: entryKey,
        });
    }

    handleEmptyExcerptCreate = () => {
        // NOTE: onExcerptCreate should be passed to widgetfaram as well
        this.props.onExcerptCreate({ type: 'excerpt', value: '' });
    }

    handleEntryDelete = () => {
        const { entry } = this.props;
        if (!entry) {
            return;
        }
        this.props.markAsDeletedEntry({
            leadId: this.props.leadId,
            key: entryAccessor.key(entry),
            value: true,
        });
    }

    render() {
        const {
            entry,
            // tabularDataForSelectedEntry,
            // tabularData, // eslint-disable-line no-unused-vars
            leadId, // eslint-disable-line no-unused-vars
            entries, // eslint-disable-line no-unused-vars
            statuses,
            selectedEntryKey, // eslint-disable-line no-unused-vars
            entryStates,

            tabularFields,

            ...otherProps
        } = this.props;

        const pending = statuses[selectedEntryKey] === ENTRY_STATUS.requesting;
        const key = Overview.entryKeySelector(entry);

        const fieldId = entryAccessor.tabularField(entry);
        const field = tabularFields[fieldId];

        return (
            <ResizableH
                className={styles.overview}
                leftChild={
                    <LeadPane
                        onExcerptCreate={this.props.onExcerptCreate}
                        tabularFields={tabularFields}
                    />
                }
                rightChild={
                    <React.Fragment>
                        <header className={styles.header}>
                            <div className={styles.actionButtons}>
                                <Cloak
                                    hide={Overview.shouldHideEntryAdd}
                                    render={
                                        <PrimaryButton
                                            onClick={this.handleEmptyExcerptCreate}
                                            className={styles.addNewEntryButton}
                                            iconName="add"
                                            title={_ts('editEntry.overview', 'addExcerptTooltip')}
                                        />
                                    }
                                />
                                <Cloak
                                    hide={this.shouldHideEntryDelete}
                                    render={
                                        <DangerButton
                                            onClick={this.handleEntryDelete}
                                            disabled={pending}
                                            // disabled={!entry || pending}
                                            iconName="remove"
                                            title={_ts('editEntry.overview', 'deleteExcerptTooltip')}
                                        />
                                    }
                                />
                            </div>
                            <SelectInput
                                className={styles.entrySelectInput}
                                placeholder={_ts('editEntry.overview', 'selectEntryPlaceholder')}
                                keySelector={Overview.entryKeySelector}
                                labelSelector={this.entryLabelSelector}
                                onChange={this.handleEntrySelect}
                                options={this.props.entries}
                                value={this.props.selectedEntryKey}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                            />
                        </header>
                        <WidgetFaram
                            className={styles.content}
                            // NOTE: dismount on key change
                            key={key}
                            entry={entry}
                            pending={pending}
                            widgetType={VIEW.overview}
                            entryState={entryStates[key]}
                            tabularData={field}
                            {...otherProps}
                        />
                    </React.Fragment>
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
