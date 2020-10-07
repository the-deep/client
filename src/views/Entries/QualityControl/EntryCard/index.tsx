import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import ExcerptOutput from '#widgetComponents/ExcerptOutput';
import DateOutput from '#components/viewer/DateOutput';
import EntryCommentButton from '#components/general/EntryCommentButton';
import EntryDeleteButton from '#components/general/EntryDeleteButton';
import EntryEditButton from '#components/general/EntryEditButton';
import EntryOpenLink from '#components/general/EntryOpenLink';
import EntryVerify from '#components/general/EntryVerify';

import {
    EntryFields,
    OrganizationFields,
    LeadWithGroupedEntriesFields,
    EntryType,
} from '#typings/entry';
import {
    FrameworkFields,
} from '#typings/framework';

import _ts from '#ts';

import styles from './styles.scss';

interface AuthorListOutputProps {
    className?: string;
    value: OrganizationFields[];
}

const entryTypeToValueMap: {
    [key in EntryType]: keyof EntryFields;
} = {
    excerpt: 'excerpt',
    image: 'image',
    dataSeries: 'tabularFieldData',
};

const entryTypeToExcerptTypeMap: {
    [key in EntryType]: 'text' | 'image' | 'dataSeries';
} = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
};

function AuthorListOutput(props: AuthorListOutputProps) {
    const {
        className,
        value = [],
    } = props;

    const displayValue = value.map(o => o.title).join(', ');

    return (
        <div
            className={_cs(styles.authorListOutput, className)}
            title={_ts('entries.qualityControl', 'authorListTooltip', { authors: displayValue })}
        >
            { value.length > 0 && (
                <Icon
                    className={styles.icon}
                    name="userGroup"
                />
            )}
            <div className={styles.value}>
                {displayValue}
            </div>
        </div>
    );
}

interface EntryCardProps {
    className?: string;
    entry: EntryFields;
    lead: Omit<LeadWithGroupedEntriesFields, 'entries'>;
    framework: FrameworkFields;
}

function EntryCard(props: EntryCardProps) {
    const {
        className,
        entry,
        lead,
        framework,
    } = props;

    const leadSource = lead.sourceDetails ? lead.sourceDetails.title : lead.sourceRaw;

    return (
        <div className={_cs(className, styles.entryCard, entry.verified && styles.verified)}>
            <section className={styles.top}>
                <div className={styles.row}>
                    <AuthorListOutput
                        className={styles.authorList}
                        value={lead.authorsDetails}
                    />
                    <DateOutput
                        className={styles.publishedOn}
                        value={lead.publishedOn}
                        tooltip={_ts('entries.qualityControl', 'leadPublishedOnTooltip')}
                    />
                    {lead.pageCount && (
                        <div
                            className={styles.pageCount}
                            title={_ts('entries.qualityControl', 'leadPageCountTooltip')}
                        >
                            <Icon
                                className={styles.icon}
                                name="book"
                            />
                            <div className={styles.value}>
                                {lead.pageCount}
                            </div>
                        </div>
                    )}
                </div>
                <div className={styles.titleRow}>
                    <div
                        className={styles.title}
                        title={lead.title}
                    >
                        { lead.title }
                    </div>
                </div>
            </section>
            <section className={styles.middle}>
                <div className={styles.row}>
                    <ExcerptOutput
                        className={styles.excerptOutput}
                        type={entryTypeToExcerptTypeMap[entry.entryType]}
                        value={entry[entryTypeToValueMap[entry.entryType]]}
                    />
                </div>
            </section>
            <section className={styles.bottom}>
                <div className={styles.row}>
                    <div className={styles.source}>
                        <Icon
                            name="world"
                            className={styles.title}
                        />
                        <div
                            className={styles.value}
                            title={_ts('entries.qualityControl', 'leadSourceTooltip', { leadSource })}
                        >
                            { lead.sourceDetails ? lead.sourceDetails.title : lead.sourceRaw }
                        </div>
                    </div>
                    <div className={styles.confidentiality}>
                        { lead.confidentialityDisplay }
                    </div>
                </div>
                <div className={styles.entryDetailsRow}>
                    <div
                        className={styles.createdBy}
                        title={_ts('entries.qualityControl', 'leadCreatedByTooltip', { user: entry.createdByName })}
                    >
                        { entry.createdByName }
                    </div>
                    <DateOutput
                        className={styles.createdAt}
                        value={entry.createdAt}
                        tooltip={_ts('entries.qualityControl', 'entryCreatedOnTooltip')}
                    />
                </div>
                <div className={styles.actions}>
                    <EntryDeleteButton
                        entryId={entry.id}
                    />
                    <EntryOpenLink
                        entryId={entry.id}
                        leadId={entry.lead}
                        projectId={entry.project}
                    />
                    <EntryCommentButton
                        entryId={entry.id}
                        commentCount={entry.unresolvedCommentCount}
                        assignee={lead.assigneeDetails.id}
                    />
                    <EntryEditButton
                        entry={entry}
                        framework={framework}
                    />
                    {/* FIXME: this component cannot be used, since it changes value in redux */}
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
                        value={entry.verified}
                        entryId={entry.id}
                        leadId={entry.lead}
                        // onPendingChange={}
                    />
                </div>
            </section>
        </div>
    );
}

export default EntryCard;
