import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import Cloak from '#components/general/Cloak';
import Button from '#rsca/Button';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import {
    iconNames,
    pathNames,
} from '#constants';
import { reverseRoute } from '#rsu/common';
import {
    leadTypeIconMap,
    leadPaneTypeMap,
    LEAD_PANE_TYPE,
} from '#entities/lead';
import _ts from '#ts';
import { timeFrom } from '#utils/common';

import leadThumbnail from '#resources/img/lead-thumbnail.png';
import styles from './styles.scss';

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
        return imgHeight;
    }

    static shouldHideEntryAdd = ({ hasAnalysisFramework, entryPermissions }) => (
        !hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify)
    )

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
                    faramValues: lead,
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
        let icon = iconNames.documentText;
        if (lead.attachment) {
            icon = leadTypeIconMap[lead.attachment.mimeType];
        } else if (lead.url) {
            icon = iconNames.globe;
        }
        return icon;
    }

    getThumbnail = () => {
        const { lead } = this.props;

        let thumbnail = `url(${leadThumbnail})`;

        if (lead.thumbnail) {
            thumbnail = `url(${lead.thumbnail})`;
        } else if (lead.attachment &&
            leadPaneTypeMap[lead.attachment.mimeType] === LEAD_PANE_TYPE.image) {
            thumbnail = `url(${lead.attachment.file})`;
        }

        return thumbnail;
    }

    handleMarkAsProcessedClick = () => {
        this.props.onMarkProcessed(this.props.lead);
    }

    handleMarkAsPendingClick = () => {
        this.props.onMarkPending(this.props.lead);
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
                    iconName={iconNames.check}
                />
            );
        } else if (lead.status === 'processed') {
            return (
                <Button
                    tabIndex="-1"
                    title={_ts('leads', 'markAsPendingTitle')}
                    className={classNames(styles.markPending, styles.mark)}
                    onClick={this.handleMarkAsPendingClick}
                    transparent
                    iconName={iconNames.close}
                />
            );
        }

        return null;
    }

    renderActions = () => {
        const MarkAction = this.renderMarkAction;

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
                                <i className={iconNames.add} />
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
                        iconName={iconNames.search}
                    />
                    <Link
                        className={styles.actionButton}
                        title={_ts('leads', 'editLeadButtonTitle')}
                        to={this.links.editLead}
                    >
                        <i className={iconNames.edit} />
                    </Link>
                    <DangerConfirmButton
                        tabIndex="-1"
                        title={_ts('leads', 'removeLeadLeadButtonTitle')}
                        onClick={this.handleRemoveLeadClick}
                        transparent
                        iconName={iconNames.trash}
                        confirmationMessage={_ts('leads', 'leadDeleteConfirmText')}
                    />
                </div>
            </React.Fragment>
        );
    }

    render() {
        const { lead, className, style } = this.props;
        const Actions = this.renderActions;
        const isProcessed = lead.status === 'processed';
        const thumbnail = this.getThumbnail();
        const mimeIcon = this.getMimeIcon();

        return (
            <div
                className={classNames(className, styles.lead)}
                style={{ ...style }}
            >
                <div
                    className={styles.thumbnailWrapper}
                    style={{
                        backgroundImage: thumbnail,
                    }}
                    role="button"
                    tabIndex="-1"
                    onKeyDown={noop}
                    onClick={this.handleLeadClick}
                />
                <div className={classNames({
                    [styles.documentTypePending]: !isProcessed,
                    [styles.documentTypeProcessed]: isProcessed,
                })}
                >
                    <i className={mimeIcon} />
                </div>

                <Actions />

                <div className={styles.leadInfo}>
                    <span className={styles.timeFrom}>
                        {timeFrom(lead.createdAt)}
                    </span>
                    <p className={styles.title}>
                        {lead.title}
                    </p>
                    <div className={styles.leadInfoExtra}>
                        <Link
                            className={styles.user}
                            to={reverseRoute(pathNames.userProfile,
                                { userId: lead.assigneeDetails.id })}
                        >
                            {_ts('leads', 'assignee')}: {lead.assigneeDetails.displayName}
                        </Link>
                        <Link
                            className={styles.user}
                            to={reverseRoute(pathNames.userProfile, { userId: lead.createdBy })}
                        >
                            {_ts('leadsGrid', 'publisherLabel')}: {lead.createdByName}
                        </Link>
                        <div className={styles.leadInfoCounts}>
                            {
                                lead.pageCount > 1 ? (
                                    <span>
                                        {lead.pageCount || 0} {_ts('leadsGrid', 'pagesLabel')}
                                    </span>) :
                                    (
                                        <span>
                                            {lead.wordCount || 0} {_ts('leadsGrid', 'wordsLabel')}
                                        </span>
                                    )
                            }
                            <span className={styles.entries}>
                                {lead.noOfEntries || 0} {_ts('leadsGrid', 'entriesLabel')}
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
