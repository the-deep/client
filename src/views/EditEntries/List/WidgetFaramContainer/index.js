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
import EntryCommentModal from '#components/general/EntryCommentModal';
import Button from '#rsca/Button';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';
import EntryVerify from '#components/general/EntryVerify';

import {
    entryAccessor,
    getEntryGroupsForEntry,
} from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesSetSelectedEntryKeyAction,
    editEntriesSetEntryVerificationStatusAction,
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
    setEntryVerificationStatus: PropTypes.func.isRequired,

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
    setEntryVerificationStatus: params => dispatch(
        editEntriesSetEntryVerificationStatusAction(params),
    ),
    markAsDeletedEntry: params => dispatch(editEntriesMarkAsDeletedEntryAction(params)),
});

const entryLabelKeySelector = d => d.labelId;

function WidgetFaramContainer(props) {
    const {
        widgets,
        setEntryCommentsCount,
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
        setEntryVerificationStatus,
        markAsDeletedEntry,
    } = props;

    const [verifyPending, setVerifyChangePending] = useState(false);

    const {
        serverData: {
            unresolvedCommentCount,
        },
    } = entry;

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

    const handleCommentsCountChange = useCallback((
        newUnresolvedCommentCount,
        resolvedCommentCount,
        entryId,
    ) => {
        const entryForPatch = {
            unresolvedCommentCount: newUnresolvedCommentCount,
            resolvedCommentCount,
            entryId,
        };

        setEntryCommentsCount({ entry: entryForPatch, leadId });
    }, [setEntryCommentsCount, leadId]);

    const handleVerificationChange = useCallback((_, newEntry) => {
        const entryForPatch = {
            versionId: newEntry.versionId,
            verified: newEntry.verified,
            entryId: newEntry.id,
        };

        setEntryVerificationStatus({ entry: entryForPatch, leadId });
    }, [setEntryVerificationStatus, leadId]);

    const entryServerId = entryAccessor.serverId(entry);
    const entryKey = entryAccessor.key(entry);
    const verified = entryAccessor.verified(entry);

    const defaultAssignees = useMemo(() => [
        entryAccessor.createdBy(entry),
    ], [entry]);

    const entryLabelsForEntry = useMemo(() => (
        getEntryGroupsForEntry(
            entryGroups,
            entryKey,
            labels,
        )
    ), [entryKey, entryGroups, labels]);

    const disableVerifiedButton = !entry?.localData?.isPristine
        || isFalsy(entryAccessor.serverId(entry));

    const entryLabelsRendererParams = useCallback((key, data) => ({
        title: `${data.labelTitle} (${data.count})`,
        titleClassName: styles.title,
        className: styles.entryLabel,
        labelColor: data.labelColor,
        groups: data.groups,
    }), []);

    return (
        <div
            className={_cs(
                classNameFromProps,
                styles.widgetFaramContainer,
                entryKey === selectedEntryKey && styles.selected,
            )}
        >
            {verifyPending && <LoadingAnimation />}
            <header className={_cs('widget-container-header', styles.header)}>
                <h3 className={styles.heading}>
                    {/* FIXME: use strings */}
                    {`Entry ${index + 1}`}
                </h3>
                <ListView
                    data={entryLabelsForEntry}
                    className={styles.entryLabels}
                    rendererParams={entryLabelsRendererParams}
                    renderer={EntryLabelBadge}
                    keySelector={entryLabelKeySelector}
                    emptyComponent={null}
                />
                <EntryVerify
                    title={entry.verificationLastChangedByDetails ? (
                        _ts(
                            'entries',
                            'verificationLastChangedBy',
                            {
                                userName: entry
                                    .verificationLastChangedByDetails.displayName,
                            },
                        )
                    ) : undefined}
                    entryId={entryAccessor.serverId(entry)}
                    leadId={leadId}
                    versionId={entryAccessor.versionId(entry)}
                    disabled={disableVerifiedButton}
                    value={verified}
                    handleEntryVerify={handleVerificationChange}
                    className={styles.entryVerifyButton}
                    onPendingChange={setVerifyChangePending}
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
                            onCommentsCountChange={handleCommentsCountChange}
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
