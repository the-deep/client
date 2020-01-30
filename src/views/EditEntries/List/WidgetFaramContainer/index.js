import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import EntryGroupModal from '#components/general/EntryGroupModal';
import EntryCommentModal from '#components/general/EntryCommentModal';
import Button from '#rsca/Button';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Cloak from '#components/general/Cloak';

import { entryAccessor } from '#entities/editEntries';
import {
    editEntriesLabelsSelector,
    editEntriesFilteredEntryGroupsSelector,

    editEntriesSetSelectedEntryKeyAction,
    editEntriesSetEntryCommentsCountAction,
    editEntriesMarkAsDeletedEntryAction,
} from '#redux';

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

@connect(mapStateToProps, mapDispatchToProps)
export default class WidgetFaramContainer extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    containerRef = React.createRef();
    dragEnterCount = 0;

    shouldHideEntryDelete = ({ entryPermissions }) => (
        !entryPermissions.delete && !!entryAccessor.serverId(this.props.entry)
    )

    shouldHideEntryEdit = ({ entryPermissions }) => (
        !entryPermissions.modify && !!entryAccessor.serverId(this.props.entry)
    )

    handleEdit = (e) => {
        const entryKey = entryAccessor.key(this.props.entry);
        this.props.setSelectedEntryKey({
            leadId: this.props.leadId,
            key: entryKey,
        });
        window.location.replace('#/overview');
        e.preventDefault();
    };

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
        } = this.props;

        const {
            serverData: {
                unresolvedCommentCount,
            },
        } = entry;

        const entryServerId = entryAccessor.serverId(entry);
        const entryKey = entryAccessor.key(entry);

        return (
            <div
                className={_cs(classNameFromProps, styles.widgetFaramContainer)}
            >
                <header className={_cs('widget-container-header', styles.header)}>
                    <h3 className={styles.heading}>
                        {/* FIXME: use strings */}
                        {`Entry ${index + 1}`}
                    </h3>
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
