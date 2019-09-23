import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { isFalsy } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import EntryCommentModal from '#components/general/EntryCommentModal';
import ResizableH from '#rscv/Resizable/ResizableH';
import Icon from '#rscg/Icon';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import Button from '#rsca/Button';

import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import {
    leadIdFromRoute,
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,
    editEntriesStatusesSelector,

    editEntriesSelectedEntryKeySelector,
    editEntriesFilteredEntriesSelector,
    editEntriesSetEntryCommentsCountAction,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
    fieldsMapForTabularBookSelector,
    routeSelector,
} from '#redux';
import { VIEW } from '#widgets';

import _ts from '#ts';
import Cloak from '#components/general/Cloak';

import WidgetFaram from '../WidgetFaram';
import LeadPane from './LeadPane';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    routeUrl: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryStates: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    onExcerptCreate: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    setEntryCommentsCount: PropTypes.func.isRequired,
};

const defaultProps = {
    entry: undefined,
    widgets: [],
    entries: [],
    statuses: {},
    tabularFields: {},
    entryStates: {},
    selectedEntryKey: undefined,
};


const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state),
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
    routeUrl: routeSelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
    statuses: editEntriesStatusesSelector(state),

    tabularFields: fieldsMapForTabularBookSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntryCommentsCount: params => dispatch(editEntriesSetEntryCommentsCountAction(params)),
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class Overview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static entryKeySelector = entry => entryAccessor.key(entry)

    static shouldHideEntryAdd = ({ entryPermissions }) => !entryPermissions.create

    constructor(props) {
        super(props);

        const urlParams = new URLSearchParams(window.location.search);
        const entryIdFromRoute = urlParams.get('entry_id');
        const {
            setSelectedEntryKey,
            leadId,
            entries,
        } = this.props;
        const entry = entries.find(e => String(entryAccessor.serverId(e)) === entryIdFromRoute);
        const entryLocalId = entryAccessor.key(entry);

        if (entryLocalId) {
            setSelectedEntryKey({
                leadId,
                key: entryLocalId,
            });
        }
        this.showInitial = !!entryLocalId;
    }

    entryLabelSelector = (entry) => {
        const values = entryAccessor.data(entry);
        const fieldId = entryAccessor.tabularField(entry);
        const { excerpt, order } = values;

        if (excerpt) {
            return excerpt;
        }

        if (fieldId) {
            const { tabularFields } = this.props;

            const field = tabularFields[fieldId];
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

    handleCommentsCountChange = (unresolvedCommentCount, resolvedCommentCount, entryId) => {
        const {
            leadId,
            setEntryCommentsCount,
        } = this.props;

        const entry = {
            unresolvedCommentCount,
            resolvedCommentCount,
            entryId,
        };

        setEntryCommentsCount({ entry, leadId });
    }

    render() {
        const {
            entry,
            leadId, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            entries, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
            statuses,
            selectedEntryKey,
            entryStates,
            routeUrl, // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars

            tabularFields,

            ...otherProps
        } = this.props;


        const pending = statuses[selectedEntryKey] === ENTRY_STATUS.requesting;
        const key = Overview.entryKeySelector(entry);

        const unresolvedCommentCount = entryAccessor.unresolvedCommentCount(entry);
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
                                value={selectedEntryKey}
                                showHintAndError={false}
                                showLabel={false}
                                hideClearButton
                            />
                            <ModalButton
                                className={styles.entryCommentButton}
                                disabled={isFalsy(entryAccessor.serverId(entry))}
                                initialShowModal={this.showInitial}
                                modal={
                                    <EntryCommentModal
                                        entryServerId={entryAccessor.serverId(entry)}
                                        onCommentsCountChange={this.handleCommentsCountChange}
                                    />
                                }
                            >
                                <Icon name="chat" />
                                {unresolvedCommentCount > 0 &&
                                    <div className={styles.commentCount}>
                                        {unresolvedCommentCount}
                                    </div>
                                }
                            </ModalButton>
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
