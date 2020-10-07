import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

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

function AuthorListOutput(props: AuthorListOutputProps) {
    const {
        className,
        value = [],
    } = props;

    return (
        <div className={_cs(styles.authorListOutput, className)}>
            { value.length > 0 && (
                <Icon
                    className={styles.icon}
                    name="userGroup"
                />
            )}
            <div className={styles.value}>
                { value.map(o => o.title).join(', ') }
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
                    />
                    {lead.pageCount && (
                        <div className={styles.pageCount}>
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
                    <div className={styles.title}>
                        { lead.title }
                    </div>
                </div>
            </section>
            <section className={styles.middle}>
                <div className={styles.row}>
                    { entry.entryType === 'image' ? (
                        <img
                            src={entry.image}
                            alt={entry.excerpt}
                        />
                    ) : (
                        <div className={styles.excerpt}>
                            { entry.excerpt }
                        </div>
                    )}
                </div>
            </section>
            <section className={styles.bottom}>
                <div className={styles.row}>
                    <div className={styles.source}>
                        <Icon
                            name="world"
                            className={styles.title}
                        />
                        <div className={styles.value}>
                            { lead.sourceDetails ? lead.sourceDetails.title : lead.sourceRaw }
                        </div>
                    </div>
                    <div className={styles.confidentiality}>
                        { lead.confidentialityDisplay }
                    </div>
                </div>
                <div className={styles.entryDetailsRow}>
                    <div className={styles.createdBy}>
                        { entry.createdByName }
                    </div>
                    <DateOutput
                        className={styles.createdAt}
                        value={entry.createdAt}
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
