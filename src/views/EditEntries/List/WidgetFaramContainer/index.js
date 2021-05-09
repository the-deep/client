import PropTypes from 'prop-types';
import React, { memo, useMemo, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import ListView from '#rscv/List/ListView';
import EntryGroupModal from '#components/general/EntryGroupModal';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';
import EntryCommentButton from '#components/general/EntryCommentButton';
import ToggleEntryControl from '#components/general/ToggleEntryControl';

import {
    entryAccessor,
    getEntryGroupsForEntry,
} from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesSetSelectedEntryKeyAction,
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
    index: PropTypes.number.isRequired,
    entryGroups: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    labels: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    schema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    computeSchema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onEntryStateChange: PropTypes.func.isRequired,

    selectedEntryKey: PropTypes.string,

    entryState: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    tabularData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    widgets: [],
    pending: false,
    className: '',
    entry: undefined,
    entryGroups: [],
    labels: [],
    selectedEntryKey: undefined,

    entryState: undefined,
    tabularData: undefined,
};

const mapStateToProps = state => ({
    entryGroups: editEntriesFilteredEntryGroupsSelector(state),
    labels: editEntriesLabelsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedEntryKey: params => dispatch(editEntriesSetSelectedEntryKeyAction(params)),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

const entryLabelKeySelector = d => d.labelId;

function WidgetFaramContainer(props) {
    const {
        widgets,
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
        setSelectedEntryKey,
        markAsDeletedEntry,
    } = props;

    const [controlPending, setControlPending] = useState(false);

    const shouldHideEntryDelete = useCallback(({ entryPermissions }) => (
        !entryPermissions.delete && !!entryAccessor.serverId(entry)
    ), [entry]);

    const shouldHideEntryEdit = useCallback(({ entryPermissions }) => (
        !entryPermissions.modify && !!entryAccessor.serverId(entry)
    ), [entry]);

    const handleEdit = useCallback((e) => {
        const entryKey = entryAccessor.key(entry);

        setSelectedEntryKey({
            leadId,
            key: entryKey,
        });
        window.location.replace('#/overview');
        e.preventDefault();
    }, [leadId, entry, setSelectedEntryKey]);

    const handleEntryDelete = useCallback(() => {
        if (!entry) {
            return;
        }
        markAsDeletedEntry({
            leadId,
            key: entryAccessor.key(entry),
            value: true,
        });
    }, [markAsDeletedEntry, entry, leadId]);

    const entryKey = entryAccessor.key(entry);
    const controlled = entryAccessor.controlled(entry);

    const entryLabelsForEntry = useMemo(() => (
        getEntryGroupsForEntry(
            entryGroups,
            entryKey,
            labels,
        )
    ), [entryKey, entryGroups, labels]);

    const disableControlledButton = !entry?.localData?.isPristine
        || isFalsy(entryAccessor.serverId(entry));

    const entryLabelsRendererParams = useCallback((key, data) => ({
        title: `${data.labelTitle} (${data.count})`,
        titleClassName: styles.title,
        className: styles.entryLabel,
        labelColor: data.labelColor,
        groups: data.groups,
    }), []);

    const entryLastChangedBy = entry?.controlledChangedByDetails?.displayName;

    return (
        <div
            className={_cs(
                classNameFromProps,
                styles.widgetFaramContainer,
                entryKey === selectedEntryKey && styles.selected,
            )}
        >
            {controlPending && <LoadingAnimation />}
            <header className={_cs('widget-container-header', styles.header)}>
                <h3 className={styles.heading}>
                    {/* FIXME: use strings */}
                    {`Entry ${index + 1}`}
                </h3>
                <div className={styles.actions}>
                    <ListView
                        data={entryLabelsForEntry}
                        className={styles.entryLabels}
                        rendererParams={entryLabelsRendererParams}
                        renderer={EntryLabelBadge}
                        keySelector={entryLabelKeySelector}
                        emptyComponent={null}
                    />
                    <ToggleEntryControl
                        tooltip={entryLastChangedBy ? (
                            _ts('entries', 'controlStatusLastChangedBy', { userName: entryLastChangedBy })
                        ) : undefined}
                        entryId={entryAccessor.serverId(entry)}
                        projectId={lead.project}
                        value={controlled}
                        disabled={disableControlledButton}
                        onPendingStatusChange={setControlPending}
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
                    <EntryCommentButton entryId={entryAccessor.serverId(entry)} />
                    <Cloak
                        hide={shouldHideEntryEdit}
                        render={
                            <WarningButton
                                className={styles.button}
                                onClick={handleEdit}
                                title={_ts('editEntry.list.widgetForm', 'editButtonTooltip')}
                                iconName="edit"
                                // NOTE: no need to disable edit on save pending
                            />
                        }
                    />
                    <Cloak
                        hide={shouldHideEntryDelete}
                        render={
                            <DangerButton
                                className={styles.button}
                                iconName="delete"
                                title={_ts('editEntry.list.widgetForm', 'deleteButtonTooltip')}
                                onClick={handleEntryDelete}
                                disabled={pending}
                            />
                        }
                    />
                </div>
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

WidgetFaramContainer.propTypes = propTypes;
WidgetFaramContainer.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(memo(WidgetFaramContainer));
