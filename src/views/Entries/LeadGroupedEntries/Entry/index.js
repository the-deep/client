import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import { connect } from 'react-redux';
import { _cs } from '@togglecorp/fujs';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import GridViewLayout from '#rscv/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import EntryEditButton from '#components/general/EntryEditButton';
import EntryOpenLink from '#components/general/EntryOpenLink';
import ToggleEntryControl from '#components/general/ToggleEntryControl';
import ToggleEntryVerification from '#components/general/ToggleEntryVerification';

import Cloak from '#components/general/Cloak';
import EntryCommentButton from '#components/general/EntryCommentButton';

import {
    fetchWidgetViewComponent,
    hasWidgetViewComponent,
    VIEW,
} from '#widgets';

import {
    entriesSetEntryCommentsCountAction,
    deleteEntryAction,
    editEntryAction,
    patchEntryVerificationAction,
} from '#redux';

import {
    RequestClient,
    methods,
} from '#request';
import {
    notifyOnFailure,
    notifyOnFatal,
} from '#utils/requestNotify';

import notify from '#notify';
import _ts from '#ts';
import EntryLabelBadge from '#components/general/EntryLabel';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    framework: PropTypes.object.isRequired,
    projectId: PropTypes.number,
    leadId: PropTypes.number,
    setEntryCommentsCount: PropTypes.func.isRequired,
    onEntryEdit: PropTypes.func.isRequired,
    setEntryVerification: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
};

const defaultProps = {
    projectId: undefined,
    leadId: undefined,
    className: '',
};

const requestOptions = {
    deleteEntryRequest: {
        url: ({ props: { entry: { id } } }) => `/entries/${id}/`,
        method: methods.DELETE,
        onMount: false,
        onSuccess: ({ props }) => {
            const {
                leadId,
                onEntryDelete,
                entry: {
                    id: entryId,
                },
            } = props;
            if (onEntryDelete) {
                onEntryDelete({ leadId, entryId });
            }
            notify.send({
                title: _ts('entries', 'deleteEntrySuccessTitle'),
                type: notify.type.SUCCESS,
                message: _ts('entries', 'deleteEntrySuccessMessage'),
                duration: notify.duration.MEDIUM,
            });
        },
    },
    onFailure: notifyOnFailure(_ts('entries', 'deleteEntryFailure')),
    onFatal: notifyOnFatal(_ts('entries', 'deleteEntryFailure')),
};

const mapDispatchToProps = dispatch => ({
    setEntryCommentsCount: params => dispatch(entriesSetEntryCommentsCountAction(params)),
    onEntryDelete: params => dispatch(deleteEntryAction(params)),
    onEntryEdit: params => dispatch(editEntryAction(params)),
    setEntryVerification: params => dispatch(patchEntryVerificationAction(params)),
});

const widgetLayoutSelector = (widget) => {
    const {
        properties: {
            listGridLayout,
        } = {},
    } = widget;
    return listGridLayout;
};

const widgetKeySelector = widget => widget.key;

const emptySchema = { fields: {} };

const entryLabelKeySelector = d => d.labelId;

@connect(null, mapDispatchToProps)
@RequestClient(requestOptions)
export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static shouldHideEntryEdit = ({ entryPermissions }) => !entryPermissions.modify;
    static shouldHideEntryDelete = ({ entryPermissions }) => !entryPermissions.delete;

    constructor(props) {
        super(props);

        this.state = {
            entryControlPending: false,
        };
    }

    getWidgets = memoize(widgets => (
        widgets.filter(
            w => hasWidgetViewComponent(w.widgetId, w.properties.addedFrom),
        )
    ))

    getDefaultAssignees = memoize(createdBy => [createdBy]);

    handleCommentsCountChange = (unresolvedCommentCount, resolvedCommentCount, entryId) => {
        const {
            leadId,
            projectId,
            setEntryCommentsCount,
        } = this.props;

        const entry = {
            unresolvedCommentCount,
            resolvedCommentCount,
            entryId,
        };

        setEntryCommentsCount({ entry, projectId, leadId });
    }

    handleEntryVerificationChange = (verified, count) => {
        const {
            setEntryVerification,
            entry: {
                id: entryId,
                versionId,
            },
            leadId,
        } = this.props;

        setEntryVerification({
            entryId,
            leadId,
            status: verified,
            versionId,
            verifiedByCount: count,
        });
    }

    handleEntryControlPendingChange = (entryControlPending) => {
        this.setState({ entryControlPending });
    }

    handleEntryDelete = () => {
        const {
            requests: {
                deleteEntryRequest,
            },
        } = this.props;

        deleteEntryRequest.do();
    }

    handleEntryEdit = (entry) => {
        const {
            leadId,
            onEntryEdit,
        } = this.props;

        onEntryEdit({
            entry,
            entryId: entry.id,
            leadId,
        });
    }

    entryLabelsRendererParams = (key, data) => ({
        title: `${data.labelTitle} (${data.count})`,
        titleClassName: styles.title,
        className: styles.entryLabel,
        labelColor: data.labelColor,
        groups: data.groups,
    });

    renderWidgetHeader = (widget) => {
        const {
            title,
            widgetId,
        } = widget;

        const isExcerptWidget = widgetId === 'excerptWidget';

        return (
            <div
                className={_cs(
                    styles.header,
                    isExcerptWidget && styles.excerptWidgetHeader,
                )}
            >
                <h5
                    title={title}
                    className={_cs(
                        styles.heading,
                        isExcerptWidget && styles.excerptWidgetHeading,
                    )}
                >
                    { title }
                </h5>
            </div>
        );
    }

    renderWidgetContent = (widget) => {
        const {
            widgetId,
            id,
            properties: { addedFrom },
        } = widget;

        const {
            entry: {
                entryType,
                excerpt,
                imageDetails,
                tabularField,
                tabularFieldData,
            },
        } = this.props;

        const Widget = fetchWidgetViewComponent(widgetId, addedFrom);

        let child;
        if (widgetId === 'excerptWidget') {
            child = (
                <Widget
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}

                    entryType={entryType}
                    excerpt={excerpt}
                    imageDetails={imageDetails}
                    tabularField={tabularField}
                    tabularFieldData={tabularFieldData}
                />
            );
        } else {
            child = (
                <Widget
                    widget={widget}
                    widgetName={widgetId}
                    widgetType={VIEW.list}
                />
            );
        }

        return (
            <FaramGroup faramElementName={String(id)}>
                <FaramGroup faramElementName="data">
                    <div className={styles.content} >
                        { child }
                    </div>
                </FaramGroup>
            </FaramGroup>
        );
    }

    render() {
        const {
            className: classNameFromProps,
            framework,
            requests: {
                deleteEntryRequest: {
                    pending: deletePending,
                },
            },
            entry,
            projectId,
        } = this.props;

        const {
            id: entryId,
            attributes,
            projectLabels,
            controlled,
            isVerifiedByCurrentUser,
            verifiedByCount,
            controlLastChangedByDetails,
        } = entry;

        const { entryControlPending } = this.state;

        const filteredWidgets = this.getWidgets(framework?.widgets);

        const pending = deletePending || entryControlPending;
        const entryLastChangedBy = controlLastChangedByDetails?.displayName;

        return (
            <div className={_cs(classNameFromProps, styles.entryContainer)}>
                {pending && <LoadingAnimation />}
                <header className={_cs('entry-container-header', styles.entryHeader)}>
                    <div className={styles.rightContainer}>
                        <ListView
                            data={projectLabels}
                            className={styles.entryLabels}
                            rendererParams={this.entryLabelsRendererParams}
                            renderer={EntryLabelBadge}
                            keySelector={entryLabelKeySelector}
                            emptyComponent={null}
                        />
                        <div className={styles.toggleButtons}>
                            <ToggleEntryVerification
                                entryId={entryId}
                                projectId={projectId}
                                value={isVerifiedByCurrentUser}
                                verifyCount={verifiedByCount}
                                onChange={this.handleEntryVerificationChange}
                            />
                            <ToggleEntryControl
                                tooltip={entryLastChangedBy ? (
                                    _ts('entries', 'controlStatusLastChangedBy', { userName: entryLastChangedBy })
                                ) : undefined}
                                entryId={entryId}
                                projectId={projectId}
                                value={controlled}
                            />
                        </div>
                        <Cloak
                            hide={Entry.shouldHideEntryDelete}
                            render={
                                <DangerConfirmButton
                                    iconName="delete"
                                    onClick={this.handleEntryDelete}
                                    confirmationTitle={_ts('entries', 'deleteConfirmTitle')}
                                    confirmationMessage={_ts('entries', 'deleteConfirmMessage')}
                                    disabled={pending}
                                />
                            }
                        />
                        <EntryOpenLink
                            className={styles.link}
                            entryId={entry.id}
                            leadId={entry.lead}
                            projectId={entry.project}
                        />
                        <EntryCommentButton
                            entryId={entryId}
                        />
                        <EntryEditButton
                            className={styles.button}
                            entry={entry}
                            framework={framework}
                            onEditSuccess={this.handleEntryEdit}
                        />
                    </div>
                </header>
                <Faram
                    className={_cs(classNameFromProps, styles.entry)}
                    value={attributes}
                    schema={emptySchema}
                >
                    <GridViewLayout
                        className={styles.entry}
                        data={filteredWidgets}
                        itemClassName={styles.widget}
                        itemContentModifier={this.renderWidgetContent}
                        itemHeaderModifier={this.renderWidgetHeader}
                        keySelector={widgetKeySelector}
                        layoutSelector={widgetLayoutSelector}
                    />
                </Faram>
            </div>
        );
    }
}
