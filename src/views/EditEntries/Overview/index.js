import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
    isNotDefined,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import modalize from '#rscg/Modalize';
import EntryCommentButton from '#components/general/EntryCommentButton';
import EntryGroupModal from '#components/general/EntryGroupModal';
import ResizableH from '#rscv/Resizable/ResizableH';
import SelectInput from '#rsci/SelectInput';
import PrimaryButton from '#rsca/Button/PrimaryButton';
import DangerButton from '#rsca/Button/DangerButton';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';

import {
    entryAccessor,
    ENTRY_STATUS,
} from '#entities/editEntries';
import {
    editEntriesWidgetsSelector,
    editEntriesSelectedEntrySelector,

    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesAddEntryAction,
    editEntriesSelectedEntryKeySelector,
    editEntriesFilteredEntriesSelector,
    editEntriesSetEntryCommentsCountAction,
    editEntriesSetEntryControlStatusAction,
    editEntriesSetSelectedEntryKeyAction,
    editEntriesMarkAsDeletedEntryAction,
    fieldsMapForTabularBookSelector,
} from '#redux';
import { VIEW } from '#widgets';

import _ts from '#ts';
import Cloak from '#components/general/Cloak';
import ToggleEntryControl from '#components/general/ToggleEntryControl';

import {
    calculateFirstTimeAttributes,
} from '../entryDataCalculator';
import WidgetFaram from '../WidgetFaram';
import LeftPane from './LeftPane';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    leadId: PropTypes.number.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    selectedEntryKey: PropTypes.string,
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    statuses: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    entryStates: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularFields: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    setEntryCommentsCount: PropTypes.func.isRequired,
    setEntryControlStatus: PropTypes.func.isRequired,
    addEntry: PropTypes.func.isRequired,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: undefined,
    entry: undefined,
    widgets: [],
    entries: [],
    entryGroups: [],
    labels: [],
    statuses: {},
    tabularFields: {},
    entryStates: {},
    selectedEntryKey: undefined,
};


const mapStateToProps = (state, props) => ({
    widgets: editEntriesWidgetsSelector(state),
    entry: editEntriesSelectedEntrySelector(state),
    selectedEntryKey: editEntriesSelectedEntryKeySelector(state),
    entries: editEntriesFilteredEntriesSelector(state),
    tabularFields: fieldsMapForTabularBookSelector(state, props),

    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addEntry: params => dispatch(editEntriesAddEntryAction(params)),
    setEntryCommentsCount: params => dispatch(editEntriesSetEntryCommentsCountAction(params)),
    setEntryControlStatus: params => dispatch(
        editEntriesSetEntryControlStatusAction(params),
    ),
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

        const {
            setSelectedEntryKey,
            leadId,
            entries,
        } = this.props;

        this.state = {
            entryControlPending: false,
        };

        const urlParams = new URLSearchParams(window.location.search);
        const entryIdFromRoute = urlParams.get('entry_id');
        const showComment = urlParams.get('show_comment');
        const entry = entries.find(e => String(entryAccessor.serverId(e)) === entryIdFromRoute);
        const entryLocalId = entryAccessor.key(entry);
        if (entryLocalId) {
            setSelectedEntryKey({
                leadId,
                key: entryLocalId,
            });
        }

        this.showInitial = !!entryLocalId && showComment === 'true';
    }

    componentWillUnmount() {
        clearTimeout(this.entryCommentTimeout);
    }

    getDefaultAssignees = memoize(entry => [entryAccessor.createdBy(entry)]);

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

    // can only create entry
    handleExcerptCreate = (excerptData) => {
        const {
            leadId,
            analysisFramework,
            lead,
        } = this.props;

        const {
            type,
            value,
            dropped,
            imageDetails,
        } = excerptData;

        this.props.addEntry({
            leadId,
            entry: {
                analysisFramework: analysisFramework.id,
                excerptType: type,
                excerptValue: value,
                attributes: calculateFirstTimeAttributes(
                    {},
                    analysisFramework,
                    lead,
                ),
            },
            imageDetails,
            dropped,
        });
    }

    handleEmptyExcerptCreate = () => {
        this.handleExcerptCreate({ type: 'excerpt', value: '' });
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

    handleControlChange = (controlled) => {
        const {
            entry: entryFromProps,
            leadId,
            setEntryControlStatus,
        } = this.props;

        const entry = {
            id: entryAccessor.serverId(entryFromProps),
            controlled,
            versionId: entryFromProps.versionId,
        };

        setEntryControlStatus({ entry, leadId });
    }

    handleEntryControlPendingChange = (entryControlPending) => {
        this.setState({ entryControlPending });
    }

    render() {
        const {
            className,
            entry,
            leadId,
            lead,
            analysisFramework,
            statuses,
            selectedEntryKey,
            entryStates,
            schema,
            computeSchema,
            onEntryStateChange,
            widgets,

            tabularFields,

            entryGroups,
            labels,
        } = this.props;

        const {
            entryControlPending,
        } = this.state;

        const pending = statuses[selectedEntryKey] === ENTRY_STATUS.requesting;
        const key = Overview.entryKeySelector(entry);

        const fieldId = entryAccessor.tabularField(entry);
        const controlled = entryAccessor.controlled(entry);

        const disableControlledButton = !entry?.localData?.isPristine
            || isFalsy(entryAccessor.serverId(entry));

        const entryLastChangedBy = entry?.controlLastChangedByDetails?.displayName;
        return (
            <ResizableH
                className={_cs(className, styles.overview)}
                leftChild={
                    <LeftPane
                        className={styles.leftPanel}
                        onExcerptCreate={this.handleExcerptCreate}
                        tabularFields={tabularFields}
                        selectedEntryKey={this.props.selectedEntryKey}
                        filteredEntries={this.props.entries}
                        statuses={this.props.statuses}
                    />
                }
                rightChild={
                    <React.Fragment>
                        {entryControlPending && <LoadingAnimation />}
                        <header className={styles.header}>
                            <div className={styles.leftActionButtons}>
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
                            <div className={styles.rightActionButtons}>
                                <ToggleEntryControl
                                    tooltip={entryLastChangedBy ? (
                                        _ts('entries', 'controlStatusLastChangedBy', { userName: entryLastChangedBy })
                                    ) : undefined}
                                    entryId={entryAccessor.serverId(entry)}
                                    projectId={lead.project}
                                    value={controlled}
                                    onChange={this.handleControlChange}
                                    onPendingStatusChange={this.handleEntryControlPendingChange}
                                    disabled={disableControlledButton}
                                />
                                {labels.length > 0 && (
                                    <ModalButton
                                        iconName="album"
                                        disabled={isNotDefined(selectedEntryKey)}
                                        modal={
                                            <EntryGroupModal
                                                entryGroups={entryGroups}
                                                labels={labels}
                                                selectedEntryKey={selectedEntryKey}
                                                selectedEntryServerId={
                                                    entryAccessor.serverId(entry)
                                                }
                                                leadId={leadId}
                                            />
                                        }
                                    />
                                )}
                                <EntryCommentButton entryId={entryAccessor.serverId(entry)} />
                                <Cloak
                                    hide={this.shouldHideEntryDelete}
                                    render={
                                        <DangerButton
                                            onClick={this.handleEntryDelete}
                                            disabled={pending}
                                            iconName="delete"
                                            title={_ts('editEntry.overview', 'deleteExcerptTooltip')}
                                        />
                                    }
                                />
                            </div>
                        </header>
                        <WidgetFaram
                            className={styles.content}
                            // NOTE: dismount on key change
                            // NOTE: removed dismount on key change behavior
                            // to persist active UI state
                            // key={key}
                            widgetType={VIEW.overview}
                            entry={entry}
                            pending={pending}
                            widgets={widgets}
                            entryState={entryStates[key]}
                            tabularData={tabularFields[fieldId]}
                            schema={schema}
                            computeSchema={computeSchema}
                            onEntryStateChange={onEntryStateChange}
                            analysisFramework={analysisFramework}
                            lead={lead}
                            leadId={leadId}
                        />
                    </React.Fragment>
                }
                leftContainerClassName={styles.left}
                rightContainerClassName={styles.right}
            />
        );
    }
}
