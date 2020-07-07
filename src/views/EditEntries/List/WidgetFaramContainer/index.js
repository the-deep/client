import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import EntryGroupModal from '#components/general/EntryGroupModal';
import EntryCommentModal from '#components/general/EntryCommentModal';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';

import {
    entryAccessor,
    getEntryGroupsForEntry,
} from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesSetSelectedEntryKeyAction,
    editEntriesSetEntryCommentsCountAction,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

import EntryLabelBadge from '#components/general/EntryLabel';

import _ts from '#ts';

import WidgetFaram from '../../WidgetFaram';
import HeaderComponent from './HeaderComponent';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
    className: PropTypes.string,
    widgetType: PropTypes.string.isRequired,
    entry: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    setSelectedEntryKey: PropTypes.func.isRequired,
    leadId: PropTypes.number.isRequired,
    markAsDeletedEntry: PropTypes.func.isRequired,
    setEntryCommentsCount: PropTypes.func.isRequired,

    index: PropTypes.number.isRequired,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widgets: [],
    pending: false,
    className: '',
    entry: undefined,
    entryGroups: [],
    labels: [],
};

const mapStateToProps = state => ({
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    setEntryCommentsCount: params => dispatch(editEntriesSetEntryCommentsCountAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

const entryLabelKeySelector = d => d.labelId;

@connect(mapStateToProps, mapDispatchToProps)
export default class WidgetFaramContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getEntryGroupsForCurrentEntry = memoize(getEntryGroupsForEntry);
    getDefaultAssignees = memoize(entry => [entryAccessor.createdBy(entry)]);

    containerRef = React.createRef();
    dragEnterCount = 0;

    shouldHideEntryDelete = ({ entryPermissions }) => (
        !entryPermissions.delete && !!entryAccessor.serverId(this.props.entry)
    )

    shouldHideEntryEdit = ({ entryPermissions }) => (
        !entryPermissions.modify && !!entryAccessor.serverId(this.props.entry)
    )

    handleEdit = (e) => {
        const {
            entry,
            setSelectedEntryKey,
            leadId,
        } = this.props;

        const entryKey = entryAccessor.key(entry);

        setSelectedEntryKey({
            leadId,
            key: entryKey,
        });
        window.location.replace('#/overview');
        e.preventDefault();
    };

    handleEntryDelete = () => {
        const {
            entry,
            leadId,
            markAsDeletedEntry,
        } = this.props;

        if (!entry) {
            return;
        }
        markAsDeletedEntry({
            leadId,
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

    entryLabelsRendererParams = (key, data) => ({
        title: `${data.labelTitle} (${data.count})`,
        titleClassName: styles.title,
        className: styles.entryLabel,
        labelColor: data.labelColor,
        groups: data.groups,
    });

    render() {
        const {
            widgets, // eslint-disable-line no-unused-vars
            className: classNameFromProps,
            pending,
            widgetType,
            entry,
            index,
            entryState,
            tabularData,
            schema,
            computeSchema,
            onEntryStateChange,
            analysisFramework,
            lead,
            leadId,
            entryGroups,
            labels,
            selectedEntryKey,
        } = this.props;

        const {
            serverData: {
                unresolvedCommentCount,
            },
        } = entry;

        const entryServerId = entryAccessor.serverId(entry);
        const entryKey = entryAccessor.key(entry);

        const entryLabelsForEntry = this.getEntryGroupsForCurrentEntry(
            entryGroups,
            entryKey,
            labels,
        );

        const defaultAssignees = this.getDefaultAssignees(entry);

        return (
            <div className={_cs(
                classNameFromProps,
                styles.widgetFaramContainer,
                entryKey === selectedEntryKey && styles.selected,
            )}
            >
                <header className={_cs('widget-container-header', styles.header)}>
                    <h3 className={styles.heading}>
                        {/* FIXME: use strings */}
                        {`Entry ${index + 1}`}
                    </h3>
                    <ListView
                        data={entryLabelsForEntry}
                        className={styles.entryLabels}
                        rendererParams={this.entryLabelsRendererParams}
                        renderer={EntryLabelBadge}
                        keySelector={entryLabelKeySelector}
                        emptyComponent={null}
                    />
                    {labels.length > 0 && (
                        <ModalButton
                            iconName="album"
                            modal={
                                <EntryGroupModal
                                    entryGroups={entryGroups}
                                    labels={labels}
                                    selectedEntryKey={entryKey}
                                    selectedEntryServerId={entryAccessor.serverId(entry)}
                                    leadId={leadId}
                                />
                            }
                        />
                    )}
                    <ModalButton
                        disabled={isFalsy(entryServerId)}
                        className={
                            _cs(
                                styles.entryCommentButton,
                                unresolvedCommentCount > 0 && styles.accented,
                            )
                        }
                        modal={
                            <EntryCommentModal
                                entryServerId={entryServerId}
                                onCommentsCountChange={this.handleCommentsCountChange}
                                defaultAssignees={defaultAssignees}
                            />
                        }
                        iconName="chat"
                    >
                        {unresolvedCommentCount > 0 &&
                            <div className={styles.commentCount}>
                                {unresolvedCommentCount}
                            </div>
                        }
                    </ModalButton>
                    <Cloak
                        hide={this.shouldHideEntryEdit}
                        render={
                            <WarningButton
                                className={styles.button}
                                onClick={this.handleEdit}
                                title={_ts('editEntry.list.widgetForm', 'editButtonTooltip')}
                                iconName="edit"
                                // NOTE: no need to disable edit on save pending
                            />
                        }
                    />
                    <Cloak
                        hide={this.shouldHideEntryDelete}
                        render={
                            <DangerButton
                                className={styles.button}
                                iconName="delete"
                                title={_ts('editEntry.list.widgetForm', 'deleteButtonTooltip')}
                                onClick={this.handleEntryDelete}
                                disabled={pending}
                            />
                        }
                    />
                </header>
                <WidgetFaram
                    className={_cs('widget', styles.widget)}
                    widgetType={widgetType}
                    entry={entry}
                    pending={pending}
                    widgets={widgets}
                    actionComponent={HeaderComponent}

                    entryState={entryState}
                    tabularData={tabularData}
                    schema={schema}
                    computeSchema={computeSchema}
                    onEntryStateChange={onEntryStateChange}
                    analysisFramework={analysisFramework}
                    lead={lead}
                    leadId={leadId}
                />
            </div>
        );
    }
}
