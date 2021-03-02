import PropTypes from 'prop-types';
import React from 'react';
import Faram, { FaramGroup } from '@togglecorp/faram';
import { connect } from 'react-redux';
import {
    _cs,
    isFalsy,
    reverseRoute,
} from '@togglecorp/fujs';
import memoize from 'memoize-one';

import ListView from '#rscv/List/ListView';
import modalize from '#rscg/Modalize';
import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import GridViewLayout from '#rscv/GridViewLayout';
import LoadingAnimation from '#rscv/LoadingAnimation';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import Cloak from '#components/general/Cloak';
import ButtonLikeLink from '#components/general/ButtonLikeLink';
import EntryVerify from '#components/general/EntryVerify';
import EntryCommentModal from '#components/general/EntryCommentModal';
import EntryReviewModal from '#components/general/EntryReviewModal';
import { pathNames } from '#constants';

import {
    fetchWidgetViewComponent,
    hasWidgetViewComponent,
    VIEW,
} from '#widgets';

import {
    entriesSetEntryCommentsCountAction,
    deleteEntryAction,
    patchEntryVerificationAction,
    activeUserSelector,
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

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,

    // eslint-disable-next-line react/forbid-prop-types
    entry: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,
    projectId: PropTypes.number,
    leadId: PropTypes.number,
    setEntryCommentsCount: PropTypes.func.isRequired,
    setEntryVerification: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    requests: PropTypes.object.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntryCommentsCount: params => dispatch(entriesSetEntryCommentsCountAction(params)),
    onEntryDelete: params => dispatch(deleteEntryAction(params)),
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

@connect(mapStateToProps, mapDispatchToProps)
@RequestClient(requestOptions)
export default class Entry extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static shouldHideEntryEdit = ({ entryPermissions }) => !entryPermissions.modify;
    static shouldHideEntryDelete = ({ entryPermissions }) => !entryPermissions.delete;

    constructor(props) {
        super(props);

        this.state = {
            entryVerificationPending: false,
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

    handleEntryVerificationChange = (entry) => {
        const {
            setEntryVerification,
            entry: {
                id: entryId,
            },
            leadId,
        } = this.props;

        setEntryVerification({
            entryId,
            leadId,
            status: entry.verified,
            versionId: entry.versionId,
        });
    }

    handleEntryVerificationPendingChange = (entryVerificationPending) => {
        this.setState({ entryVerificationPending });
    }

    handleEntryDelete = () => {
        const {
            requests: {
                deleteEntryRequest,
            },
        } = this.props;

        deleteEntryRequest.do();
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
                image,
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
                    image={image}
                    tabularField={tabularField}
                    tabularFieldData={tabularFieldData}
                />
            );
        } else {
            child = (
                <Widget
                    widget={widget}
                    widgetName={widgetId}
                    wid
                    getType={VIEW.list}
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
            widgets,
            requests: {
                deleteEntryRequest: {
                    pending: deletePending,
                },
            },
            entry: {
                id: entryId,
                createdBy,
                attributes,
                unresolvedCommentCount: commentCount,
                projectLabels,
                verified,
                verificationLastChangedByDetails,
                versionId,
            },
            projectId,
            leadId,
            activeUser,
        } = this.props;

        const { entryVerificationPending } = this.state;

        const filteredWidgets = this.getWidgets(widgets);
        const entriesPageLink = reverseRoute(
            pathNames.editEntries,
            {
                projectId,
                leadId,
            },
        );

        const defaultAssignees = this.getDefaultAssignees(createdBy);
        const pending = deletePending || entryVerificationPending;

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
                        <EntryVerify
                            className={styles.entryVerify}
                            title={verificationLastChangedByDetails ? (
                                _ts(
                                    'entries',
                                    'verificationLastChangedBy',
                                    {
                                        userName: verificationLastChangedByDetails.displayName,
                                    },
                                )
                            ) : undefined}
                            value={verified}
                            entryId={entryId}
                            versionId={versionId}
                            leadId={leadId}
                            onPendingChange={this.handleEntryVerificationPendingChange}
                            handleEntryVerify={this.handleEntryVerificationChange}
                        />
                        <ButtonLikeLink
                            className={styles.editEntryLink}
                            to={`${entriesPageLink}?entry_id=${entryId}`}
                        >
                            <Icon name="edit" />
                        </ButtonLikeLink>
                        <ModalButton
                            className={
                                _cs(
                                    styles.button,
                                    commentCount > 0 && styles.accented,
                                )
                            }
                            disabled={isFalsy(entryId)}
                            modal={
                                <EntryCommentModal
                                    entryServerId={entryId}
                                    onCommentsCountChange={this.handleCommentsCountChange}
                                    defaultAssignees={defaultAssignees}
                                />
                            }
                            iconName="chat"
                        >
                            {commentCount > 0 &&
                                <div className={styles.commentCount}>
                                    {commentCount}
                                </div>
                            }
                        </ModalButton>
                        <ModalButton
                            className={
                                _cs(
                                    styles.button,
                                )
                            }
                            modal={
                                <EntryReviewModal
                                    entryId={entryId}
                                    projectId={projectId}
                                    activeUser={activeUser}
                                />
                            }
                        >
                            {_ts('entries', 'reviewEntry')}
                        </ModalButton>
                        <Cloak
                            hide={Entry.shouldHideEntryDelete}
                            render={
                                <DangerConfirmButton
                                    iconName="delete"
                                    onClick={this.handleEntryDelete}
                                    confirmationTitle={_ts('entries', 'deleteConfirmTitle')}
                                    confirmationMessage={_ts('entries', 'deleteConfirmMessage')}
                                    disabled={pending}
                                    className={styles.deleteButton}
                                />
                            }
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
