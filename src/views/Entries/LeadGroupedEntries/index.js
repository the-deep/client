import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import {
    reverseRoute,
    _cs,
} from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';
import ListView from '#rscv/List/ListView';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';

import Cloak from '#components/general/Cloak';
import EntityLink from '#components/viewer/EntityLink';
import LeadPreview from '#views/Leads/LeadPreview';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import _ts from '#ts';

import Entry from './Entry';
import styles from './styles.scss';

const ModalButton = modalize(Button);

const propTypes = {
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    projectId: PropTypes.number.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    framework: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    headerClassName: '',
};

const entryKeySelector = d => d.id;

export default class LeadGroupedEntries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideEntryEdit = ({ entryPermissions }) => (
        !entryPermissions.modify && !entryPermissions.create && !entryPermissions.delete
    )

    getEntryParams = (_, entry) => {
        const {
            projectId,
            framework,
            lead: {
                id: leadId,
            },
        } = this.props;

        return ({
            entry,
            leadId,
            projectId,
            framework,
        });
    }

    render() {
        const { className: classNameFromProps } = this.props;
        const {
            projectId,
            headerClassName: headerClassNameFromProps,
            lead,
        } = this.props;
        const {
            title: leadTitle,
            id: leadId,
            createdAt: leadCreatedAt,
            publishedOn: leadPublisedOn,
            entries,
            url: leadUrlFromProps,
            attachment,
            assignee,
            assigneeDetails,
        } = lead;

        const route = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        });

        const leadUrl = (attachment && attachment.file) || leadUrlFromProps;
        // {_ts('entries', 'editEntryButtonLabel')}
        if (entries.length < 1) {
            return null;
        }

        return (
            <div className={_cs(classNameFromProps, styles.leadGroupedEntries)}>
                <header className={_cs(headerClassNameFromProps, styles.header)}>
                    <h3 className={styles.heading}>
                        <div
                            title={leadTitle}
                            className={styles.title}
                        >
                            {leadUrl ? (
                                <ModalButton
                                    className={styles.leadTitleButton}
                                    transparent
                                    modal={
                                        <LeadPreview value={lead} />
                                    }
                                >
                                    {leadTitle}
                                </ModalButton>
                            ) : (
                                leadTitle
                            )}
                        </div>
                        <div className={styles.leadDetails}>
                            <div className={styles.dateContainer}>
                                <Icon name="calendar" />
                                <span className={styles.dateLabel}>
                                    {_ts('entries', 'createdAtLabel')}
                                </span>
                                <FormattedDate
                                    className={styles.date}
                                    date={leadCreatedAt}
                                    mode="dd-MM-yyyy"
                                />
                            </div>
                            <div className={styles.dateContainer}>
                                <Icon name="calendar" />
                                <span className={styles.dateLabel}>
                                    {_ts('entries', 'publishedOnLabel')}
                                </span>
                                <FormattedDate
                                    className={styles.date}
                                    date={leadPublisedOn}
                                    mode="dd-MM-yyyy"
                                />
                            </div>
                            {assignee && assignee[0] && (
                                <>
                                    <Icon
                                        title={_ts('entries', 'assigneeIconTitle')}
                                        name="user"
                                    />
                                    <EntityLink
                                        className={styles.assigneeLink}
                                        link={reverseRoute(
                                            pathNames.userProfile,
                                            { userId: assignee },
                                        )}
                                        title={assigneeDetails.displayName}
                                    />
                                </>
                            )}
                        </div>
                    </h3>
                    <div
                        title={_ts('entries', 'numberOfEntriesTooltip')}
                        className={styles.numberOfEntries}
                    >
                        {/* FIXME: use string */}
                        <strong>{ entries.length }</strong> entries
                    </div>
                    <Cloak
                        {...viewsAcl.editEntries}
                        render={
                            <Link
                                className={styles.editEntryLink}
                                title={_ts('entries', 'editEntryLinkTitle')}
                                to={route}
                            >
                                <Icon name="edit" />
                            </Link>
                        }
                    />
                </header>
                <ListView
                    className={styles.entryList}
                    data={entries}
                    renderer={Entry}
                    rendererParams={this.getEntryParams}
                    keySelector={entryKeySelector}
                />
            </div>
        );
    }
}
