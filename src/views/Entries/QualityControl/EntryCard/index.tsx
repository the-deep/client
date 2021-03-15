import React, { useState, useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';

import ExcerptOutput from '#widgetComponents/ExcerptOutput';
import DateOutput from '#components/viewer/DateOutput';
import EntryCommentButton from '#components/general/EntryCommentButton';
import EntryDeleteButton from '#components/general/EntryDeleteButton';
import EntryEditButton from '#components/general/EntryEditButton';
import EntryOpenLink from '#components/general/EntryOpenLink';
import EntryVerify from '#components/general/EntryVerify';
import Cloak from '#components/general/Cloak';
import Button from '#rsca/Button';
import modalize from '#rscg/Modalize';
import LoadingAnimation from '#rscv/LoadingAnimation';
import ListView from '#rscv/List/ListView';
import ListItem, { DefaultIcon } from '#rscv/ListItem';
import EntryReviewButton from '#components/general/EntryReviewButton';

import { useLazyRequest } from '#utils/request';
import { getScaleWidgetsData } from '#utils/framework';

import LeadPreview from '#views/Leads/LeadPreview';
import LeadEditModal from '#components/general/LeadEditModal';

import {
    EntryFields,
    OrganizationFields,
    EntryType,
    Entry,
    EntryLeadType,
} from '#typings/entry';
import {
    Lead,
} from '#typings/lead';
import {
    Permission,
} from '#typings/common';
import {
    FrameworkFields,
} from '#typings/framework';
import _ts from '#ts';

import styles from './styles.scss';

const ModalButton = modalize(Button);

const EmptyComponent = () => (<div className={styles.emptyComponent} />);

interface AuthorListOutputProps {
    className?: string;
    value: OrganizationFields[];
}

const getEntryValue = (entry: Entry, entryType: EntryType) => {
    if (entryType === 'image') {
        return entry.imageDetails?.file;
    }
    if (entryType === 'dataSeries') {
        return entry.tabularFieldData;
    }
    return entry.excerpt;
};

const entryTypeToExcerptTypeMap: {
    [key in EntryType]: 'text' | 'image' | 'dataSeries';
} = {
    excerpt: 'text',
    image: 'image',
    dataSeries: 'dataSeries',
};

interface ScaleWidget {
    key: string;
    color?: string;
    label: string;
}

const widgetKeySelector = (d: ScaleWidget) => d.key;

function AuthorListOutput(props: AuthorListOutputProps) {
    const {
        className,
        value = [],
    } = props;

    const tooltipValue = value.map(o => o.title).join(', ');
    const displayValue = value.map(o => o.shortName ?? o.title).join(', ');

    return (
        <div
            className={_cs(styles.authorListOutput, className)}
            title={_ts('entries.qualityControl', 'authorListTooltip', { authors: tooltipValue })}
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
    entry: Entry;
    lead: EntryFields['lead'];
    framework: FrameworkFields;
    isDeleted?: boolean;
    onDelete: (entryId: EntryFields['id']) => void;
    onLeadChange: (lead: Pick<Lead, EntryLeadType>) => void;
    onEntryChange: (entry: Entry) => void;
}

function EntryCard(props: EntryCardProps) {
    const {
        className,
        entry,
        lead,
        framework,
        onDelete,
        isDeleted,
        onLeadChange,
        onEntryChange,
    } = props;

    const [isVisible, setVisibility] = useState(false);

    const handleShow = useCallback(() => {
        setVisibility(true);
    }, []);

    const handleHide = useCallback(() => {
        setVisibility(false);
    }, []);

    const [isEditLeadModalShown, showEditLeadModal] = React.useState<boolean>(false);

    const {
        url: leadUrlFromProps,
        attachment,
    } = lead;

    const [verifiyChangePending, setVerifyChangePending] = useState(false);

    const leadUrl = (attachment && attachment.file) ?? leadUrlFromProps;

    const leadSource = lead.sourceDetail ? lead.sourceDetail.title : lead.sourceRaw;

    const {
        pending,
        response: leadFromRequest,
        trigger: getLead,
    } = useLazyRequest<Lead>({
        url: `server://v2/leads/${lead.id}/`,
        method: 'GET',
        onSuccess: () => {
            showEditLeadModal(true);
        },
    });

    const handleDeletePendingChange = useCallback((/* isPending: boolean */) => {
        // TODO; disable all actions if pending
    }, []);

    const handleDeleteSuccess = useCallback(() => {
        onDelete(entry.id);
    }, [onDelete, entry]);

    const handleEditLeadButtonClick = () => {
        getLead(null);
    };

    const handleEditLeadModalClose = () => {
        showEditLeadModal(false);
    };

    const handleLeadEditSave = useCallback((value: Lead) => {
        onLeadChange(value);
    }, [onLeadChange]);

    const shouldHideLeadEdit = ({ leadPermissions }: { leadPermissions: Permission }) =>
        !leadPermissions.modify;

    const isConfidential = lead.confidentiality === 'confidential';

    const loading = verifiyChangePending;

    const scaleWidgets = useMemo(() => getScaleWidgetsData(framework, entry), [framework, entry]);

    const scaleWidgetRendererParams = useCallback((_: string, d: ScaleWidget) => {
        const icons = <DefaultIcon color={d.color} title={d.label} />;
        return {
            icons,
            value: d.label,
        };
    }, []);

    return (
        <div className={_cs(className, styles.entryCardContainer)}>
            {loading && <LoadingAnimation />}
            <div
                className={_cs(
                    styles.entryCard,
                    entry.verified && styles.verified,
                    isDeleted && styles.deleted,
                    isConfidential && styles.confidential,
                )}
            >
                <section className={styles.top}>
                    <div className={styles.row}>
                        <AuthorListOutput
                            className={styles.authorList}
                            value={lead.authorsDetail}
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
                                    {`${lead.pageCount}p`}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.titleRow}>
                        {leadUrl ? (
                            <ModalButton
                                className={styles.leadTitleButton}
                                transparent
                                title={lead.title}
                                modal={
                                    <LeadPreview value={lead} />
                                }
                            >
                                {lead.title}
                            </ModalButton>
                        ) : (
                            <div className={styles.leadTitle}>
                                {lead.title}
                            </div>
                        )}
                        <Cloak
                            hide={shouldHideLeadEdit}
                            render={
                                <Button
                                    className={styles.leadEditButton}
                                    iconName="edit"
                                    transparent
                                    disabled={pending || isEditLeadModalShown}
                                    onClick={handleEditLeadButtonClick}
                                />
                            }
                        />
                        {
                            isEditLeadModalShown && leadFromRequest && (
                                <LeadEditModal
                                    leadId={leadFromRequest.id}
                                    lead={leadFromRequest}
                                    closeModal={handleEditLeadModalClose}
                                    onSave={handleLeadEditSave}
                                />
                            )
                        }
                    </div>
                </section>
                <section className={styles.middle}>
                    <div className={styles.row}>
                        <ExcerptOutput
                            className={styles.excerptOutput}
                            type={entryTypeToExcerptTypeMap[entry.entryType]}
                            value={getEntryValue(entry, entry.entryType)}
                        />
                    </div>
                </section>
                <div className={styles.actionsWrapper}>
                    {isVisible && (
                        <section className={styles.bottom}>
                            <div className={styles.row}>
                                <div className={styles.source}>
                                    { leadSource && (
                                        <Icon
                                            name="world"
                                        />
                                    )}
                                    <div
                                        className={styles.value}
                                        title={_ts('entries.qualityControl', 'leadSourceTooltip', { leadSource })}
                                    >
                                        { leadSource }
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
                            <ListView
                                className={styles.scaleWidgets}
                                data={scaleWidgets}
                                renderer={ListItem}
                                rendererParams={scaleWidgetRendererParams}
                                keySelector={widgetKeySelector}
                                emptyComponent={EmptyComponent}
                            />
                        </section>
                    )}
                    <Button
                        className={styles.expandButton}
                        onClick={isVisible ? handleHide : handleShow}
                        transparent
                        iconName={isVisible ? 'chevronDown' : 'chevronUp'}
                    >
                        {isVisible ? (_ts('entries', 'less')) : (_ts('entries', 'more'))}
                    </Button>
                    <div className={styles.actions}>
                        <EntryDeleteButton
                            entryId={entry.id}
                            onPendingChange={handleDeletePendingChange}
                            onDeleteSuccess={handleDeleteSuccess}
                            disabled={isDeleted}
                        />
                        <EntryOpenLink
                            entryId={entry.id}
                            leadId={entry.lead}
                            projectId={entry.project}
                            disabled={isDeleted}
                        />
                        <EntryCommentButton
                            entryId={entry.id}
                            commentCount={entry.unresolvedCommentCount}
                            assignee={lead.assigneeDetails.id}
                            disabled={isDeleted}
                        />
                        <EntryReviewButton
                            entryId={entry.id}
                        />
                        <EntryEditButton
                            entry={entry}
                            framework={framework}
                            disabled={isDeleted}
                            onEditSuccess={onEntryChange}
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
                            value={entry.verified}
                            entryId={entry.id}
                            leadId={entry.lead}
                            versionId={entry.versionId}
                            disabled={isDeleted}
                            handleEntryVerify={onEntryChange}
                            onPendingChange={setVerifyChangePending}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EntryCard;
