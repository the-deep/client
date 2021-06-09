import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {
    reverseRoute,
    isDefined,
    isTruthy,
} from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Numeral from '#rscv/Numeral';
import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import Cloak from '#components/general/Cloak';
import LeadCopyModal from '#components/general/LeadCopyModal';
import EmmStatsModal from '#components/viewer/EmmStatsModal';
import { organizationTitleSelector } from '#entities/organization';
import {
    pathNames,
} from '#constants';
import {
    mimeTypeToIconMap,
    mimeType,
} from '#entities/lead';
import _ts from '#ts';
import { timeFrom } from '#utils/common';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    itemIndex: PropTypes.number.isRequired,
    onLeadClick: PropTypes.func.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    onMarkProcessed: PropTypes.func.isRequired,
    onMarkPending: PropTypes.func.isRequired,
    onMarkValidated: PropTypes.func.isRequired,
    minHeight: PropTypes.number, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
    className: '',
    style: {},
    minHeight: 295,
};

const noop = () => {};

export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // for masonry
    static getItemHeight = (state, props) => {
        const { width, minHeight } = state;
        const {
            thumbnailHeight = 400, thumbnailWidth = 250,
        } = props;
        // item is wrapped by masonry
        const imgHeight = Math.max((width * thumbnailHeight) / thumbnailWidth, minHeight);
        return imgHeight + 75;
    }

    static shouldHideEntryAdd = ({ hasAnalysisFramework, entryPermissions }) => (
        !hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify)
    )

    static shouldHideLeadEdit = ({ leadPermissions }) => !leadPermissions.modify

    static shouldHideLeadCopy = ({ leadPermissions }) =>
        !leadPermissions.modify || !leadPermissions.create

    get links() {
        const { activeProject, lead } = this.props;
        return {
            editLead: {
                pathname: reverseRoute(
                    pathNames.addLeads,
                    {
                        projectId: activeProject,
                    },
                ),
                state: {
                    serverId: lead.id,
                    faramValues: {
                        title: lead.title,
                        sourceType: lead.sourceType,
                        project: lead.project,
                        source: lead.source,
                        authors: lead.authors,
                        sourceRaw: lead.sourceRaw,
                        authorRaw: lead.authorRaw,
                        confidentiality: lead.confidentiality,
                        assignee: lead.assignee,
                        publishedOn: lead.publishedOn,
                        attachment: lead.attachment,
                        website: lead.website,
                        leadGroup: lead.leadGroup,
                        url: lead.url,
                        text: lead.text,
                        tabularBook: lead.tabularBook,
                        emmTriggers: lead.emmTriggers,
                        emmEntities: lead.emmEntities,
                    },
                },
            },
            editEntries: reverseRoute(
                pathNames.editEntries,
                {
                    projectId: activeProject,
                    leadId: lead.id,
                },
            ),
        };
    }

    getMimeIcon() {
        const { lead } = this.props;
        let icon = 'documentText';
        if (lead.attachment) {
            icon = mimeTypeToIconMap[lead.attachment.mimeType];
        } else if (lead.url) {
            icon = 'globe';
        }
        return icon;
    }

    // NOTE: This is sent as an array as LeadCopyModal is built for bulk operations
    getLeadIds = memoize(row => [row.id]);

    handleMarkAsProcessedClick = () => {
        this.props.onMarkProcessed(this.props.lead);
    }

    handleMarkAsPendingClick = () => {
        this.props.onMarkPending(this.props.lead);
    }

    handleMarkAsValidatedClick = () => {
        this.props.onMarkValidated(this.props.lead);
    }

    handleRemoveLeadClick = () => {
        this.props.onRemoveLead(this.props.lead);
    }

    handleSearchLeadClick = () => {
        this.props.onSearchSimilarLead(this.props.lead);
    }

    handleLeadClick = () => {
        this.props.onLeadClick(this.props.itemIndex);
    }

    renderThumbnail = () => {
        const { lead } = this.props;
        const mimeIcon = this.getMimeIcon();

        let thumbnailImage;

        const imageMimes = [mimeType.png, mimeType.jpg, mimeType.jpeg, mimeType.fig];

        if (lead.thumbnail) {
            thumbnailImage = lead.thumbnail;
        } else if (lead.attachment && imageMimes.includes(lead.attachment.mimeType)) {
            thumbnailImage = lead.attachment.file;
        }

        if (thumbnailImage) {
            return <img alt="thumbnail" src={thumbnailImage} />;
        }
        return (
            <Icon
                name={mimeIcon}
                className={styles.mimeIcon}
            />
        );
    }

    renderMarkAction = () => {
        const { lead } = this.props;

        if (lead.status === 'pending') {
            return (
                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'markAsProcessedTitle')}
                    className={classNames(styles.markProcessed, styles.mark)}
                    onClick={this.handleMarkAsProcessedClick}
                    transparent
                    iconName="check"
                />
            );
        } else if (lead.status === 'processed') {
            return (
                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'markAsValidatedTitle')}
                    className={classNames(styles.markValidated, styles.mark)}
                    onClick={this.handleMarkAsValidatedClick}
                    transparent
                    iconName="check"
                />
            );
        } else if (lead.status === 'validated') {
            return (
                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'markAsPendingTitle')}
                    className={classNames(styles.markPending, styles.mark)}
                    onClick={this.handleMarkAsPendingClick}
                    transparent
                    iconName="close"
                />
            );
        }

        return null;
    }

    renderActions = () => {
        const { lead } = this.props;
        const MarkAction = this.renderMarkAction;

        const leadIds = this.getLeadIds(lead);

        return (
            <React.Fragment>
                <div className={styles.mainActions}>
                    <Cloak
                        hide={GridItem.shouldHideEntryAdd}
                        render={
                            <Link
                                className={styles.add}
                                tabIndex="-1"
                                title={_ts('leads', 'addEntryFromLeadButtonTitle')}
                                to={this.links.editEntries}
                            >
                                <Icon
                                    className={styles.icon}
                                    name="add"
                                />
                            </Link>
                        }
                    />
                    <MarkAction />
                </div>
                <div className={styles.actions}>
                    <Button
                        tabIndex="-1"
                        title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                        onClick={this.handleSearchLeadClick}
                        transparent
                        iconName="search"
                    />
                    <Cloak
                        hide={GridItem.shouldHideLeadCopy}
                        render={
                            <ModalButton
                                tabIndex="-1"
                                title={_ts('leads', 'exportToOtherProjectsButtonTitle')}
                                transparent
                                iconName="openLink"
                                modal={
                                    <LeadCopyModal leads={leadIds} />
                                }
                            />
                        }
                    />
                    <Cloak
                        hide={GridItem.shouldHideLeadEdit}
                        render={
                            <Link
                                className={styles.actionButton}
                                title={_ts('leads', 'editLeadButtonTitle')}
                                to={this.links.editLead}
                            >
                                <Icon
                                    className={styles.icon}
                                    name="edit"
                                />
                            </Link>
                        }
                    />
                    <Cloak
                        hide={GridItem.shouldHideLeadEdit}
                        render={
                            <DangerConfirmButton
                                tabIndex="-1"
                                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                                onClick={this.handleRemoveLeadClick}
                                transparent
                                iconName="trash"
                                confirmationMessage={_ts('leads', 'leadDeleteConfirmText')}
                            />
                        }
                    />
                </div>
            </React.Fragment>
        );
    }

    render() {
        const {
            lead = {},
            className,
            style,
        } = this.props;
        const Actions = this.renderActions;
        const Thumbnail = this.renderThumbnail;
        const {
            assigneeDetails: {
                id: assigneeId,
                displayName: assigneeDisplayName,
            } = {},
            sourceDetail,
            authorsDetail,
            sourceRaw,
            authorRaw,
            emmTriggers,
            emmEntities,
            priorityDisplay,
        } = lead;

        const source = sourceDetail ? organizationTitleSelector(sourceDetail) : sourceRaw;
        const authors = authorsDetail ? authorsDetail.map(organizationTitleSelector).join(', ') : authorRaw;

        const showEmm = (isDefined(emmEntities) && emmEntities.length > 0)
            || (isDefined(emmTriggers) && emmTriggers.length > 0);

        return (
            <div
                className={classNames(className, styles.lead)}
                style={{ ...style }}
            >
                <div
                    className={styles.thumbnailWrapper}
                    role="button"
                    tabIndex="-1"
                    onKeyDown={noop}
                    onClick={this.handleLeadClick}
                >
                    <Thumbnail />
                </div>
                <Actions />

                <div className={styles.leadInfo}>
                    <span className={styles.timeFrom}>
                        {timeFrom(lead.createdAt)}
                    </span>
                    <p className={styles.title}>
                        {showEmm &&
                            <ModalButton
                                className={styles.emmButton}
                                modal={
                                    <EmmStatsModal
                                        emmTriggers={emmTriggers}
                                        emmEntities={emmEntities}
                                    />
                                }
                            >
                                {_ts('leads', 'emmButtonLabel')}
                            </ModalButton>
                        }
                        {lead.title}
                    </p>
                    <div className={styles.leadInfoExtra}>
                        {isTruthy(assigneeId) &&
                            <Link
                                className={styles.user}
                                to={reverseRoute(pathNames.userProfile, { userId: assigneeId })}
                            >
                                {_ts('leads', 'assignee')}: {assigneeDisplayName}
                            </Link>
                        }
                        <div>
                            {_ts('leads', 'priorityLevel')}: {priorityDisplay}
                        </div>
                        <div className={styles.publisher}>
                            {_ts('leadsGrid', 'publisherLabel')}: {source}
                        </div>
                        {authors &&
                            <div className={styles.author}>
                                {_ts('leadsGrid', 'authorLabel')}: {authors}
                            </div>
                        }
                        <div className={styles.status}>
                            Status: {lead.status}
                        </div>
                        <div className={styles.leadInfoCounts}>
                            {
                                lead.pageCount > 1 ? (
                                    <span>
                                        <Numeral
                                            className={styles.numericValue}
                                            value={lead.pageCount}
                                            precision={0}
                                        />
                                        {_ts('leadsGrid', 'pagesLabel')}
                                    </span>) :
                                    (
                                        <span>
                                            <Numeral
                                                className={styles.numericValue}
                                                value={lead.wordCount}
                                                precision={0}
                                            />
                                            {_ts('leadsGrid', 'wordsLabel')}
                                        </span>
                                    )
                            }
                            <span className={styles.entries}>
                                <Numeral
                                    className={styles.numericValue}
                                    value={lead.entriesCount}
                                    precision={0}
                                />
                                {_ts('leadsGrid', 'entriesLabel')}
                            </span>
                            <span className={styles.timeFromBottom}>
                                {timeFrom(lead.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
