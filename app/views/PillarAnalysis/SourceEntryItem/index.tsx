import React, { useCallback, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import {
    _cs,
    isDefined,
    compareDate,
} from '@togglecorp/fujs';
import { useMutation, gql } from '@apollo/client';
import {
    IoBan,
    IoPeopleCircleOutline,
    IoOpenOutline,
    IoPencilOutline,
    IoRepeat,
} from 'react-icons/io5';
import {
    Tag,
    DraggableContent,
    PendingMessage,
    QuickActionDropdownMenu,
    DropdownMenuItem,
    QuickActionLink,
    QuickActionButton,
    DateOutput,
    useAlert,
    useBooleanState,
} from '@the-deep/deep-ui';

import ExcerptInput from '#components/entry/ExcerptInput';
import { GeoArea } from '#components/GeoMultiSelectInput';
import EditableEntry from '#components/entry/EditableEntry';
import LeadPreviewButton from '#components/lead/LeadPreviewButton';
import {
    DiscardedEntriesCreateMutation,
    DiscardedEntriesCreateMutationVariables,
    DiscardedEntryTagTypeEnum,
    EntryType,
} from '#generated/types';
import routes from '#base/configs/routes';
import {
    organizationShortNameSelector,
    organizationTitleSelector,
} from '#components/selections/NewOrganizationMultiSelectInput';

import { genericMemo } from '#utils/common';
import _ts from '#ts';

import { DiscardedTags, Entry, Framework } from '..';
import { transformEntry } from '../context';

import styles from './styles.css';

const DISCARDED_ENTRIES_CREATE = gql`
    mutation DiscardedEntriesCreate (
        $projectId: ID!,
        $entryId: ID!,
        $pillarId: ID!,
        $tag: DiscardedEntryTagTypeEnum!,
    ) {
        project(id: $projectId) {
            discardedEntryCreate(
                data: {
                    analysisPillar: $pillarId,
                    tag: $tag,
                    entry: $entryId,
                }
            ) {
                ok
                errors
            }
        }
    }
`;

export interface Props {
    className?: string;
    entryId: string;
    disabled?: boolean;
    pillarId: string;
    onEntryDiscard: () => void;
    discardedTags?: DiscardedTags[];
    createdAt?: string;
    pillarModifiedDate?: string;
    projectId: string;
    entry: Entry;
    framework: Framework;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;

    excerpt: Entry['excerpt'];
    image: Entry['image'];
    entryType: Entry['entryType'];
    entryAttachment: EntryType['entryAttachment'] | undefined;
}

function SourceEntryItem(props: Props) {
    const {
        className,
        entryId,
        createdAt,
        pillarModifiedDate,
        disabled,
        pillarId,
        onEntryDiscard,
        discardedTags,
        entry,
        entryType,
        projectId,
        image,
        excerpt,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
        entryAttachment,
    } = props;

    const value = useMemo(() => ({ entryId }), [entryId]);
    const alert = useAlert();
    const [
        entryCardFlipped,
        , , ,
        toggleEntryCardFlipped,
    ] = useBooleanState(false);

    const authors = useMemo(() => (
        entry?.lead.authors
            ?.map((author) => (
                organizationShortNameSelector(author) ?? organizationTitleSelector(author)
            )).join(', ')
    ), [entry?.lead]);

    const [
        createDiscardedEntry,
        {
            loading: createDiscardedEntryPending,
        },
    ] = useMutation<DiscardedEntriesCreateMutation, DiscardedEntriesCreateMutationVariables>(
        DISCARDED_ENTRIES_CREATE,
        {
            onCompleted: (response) => {
                if (!response || !response.project || !response.project.discardedEntryCreate) {
                    return;
                }

                const {
                    ok,
                    errors,
                } = response.project.discardedEntryCreate;

                if (errors) {
                    alert.show(
                        'Failed to discard entry.',
                        { variant: 'error' },
                    );
                } else if (ok) {
                    if (onEntryDiscard) {
                        onEntryDiscard();
                    }
                    alert.show(
                        'Entry discarded successfully',
                        { variant: 'success' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to discard entry.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleDiscardButtonClick = useCallback((tagKey: DiscardedEntryTagTypeEnum) => {
        if (isDefined(tagKey)) {
            createDiscardedEntry({
                variables: {
                    projectId,
                    entryId,
                    pillarId,
                    tag: tagKey,
                },
            });
        }
    }, [
        createDiscardedEntry,
        projectId,
        entryId,
        pillarId,
    ]);

    const editEntryLink = useMemo(() => ({
        pathname: generatePath(routes.entryEdit.path, {
            projectId,
            leadId: entry?.lead.id,
        }),
        state: {
            entryId: entry?.clientId,
            activePage: 'primary',
        },
        hash: '#/primary-tagging',
    }), [
        projectId,
        entry?.lead.id,
        entry?.clientId,
    ]);

    const isNewEntry = compareDate(createdAt, pillarModifiedDate) > 0;

    return (
        <DraggableContent
            className={_cs(
                className,
                styles.entryItem,
                disabled && styles.disabled,
                isNewEntry && styles.newEntry,
                entryCardFlipped && styles.isFlipped,
            )}
            name="entry"
            value={value}
            contentClassName={_cs(
                styles.children,
                entryType === 'IMAGE' && styles.image,
            )}
            spacing="compact"
            headingSize="extraSmall"
            headingClassName={styles.heading}
            headingSectionClassName={styles.headingSection}
            headingContainerClassName={styles.headingContainer}
            headerIcons={(
                <>
                    <IoPeopleCircleOutline className={styles.headingItem} />
                    <span
                        title={authors}
                        className={_cs(styles.authors, styles.headingItem)}
                    >
                        {authors}
                    </span>
                    <LeadPreviewButton
                        className={styles.previewButton}
                        title={entry.lead.title}
                        label={(<IoOpenOutline />)}
                        url={entry.lead.url}
                        attachment={entry.lead.attachment}
                    />
                </>
            )}
            heading={(
                <DateOutput
                    className={styles.headingItem}
                    format="dd/MM/yyyy"
                    value={entry.lead.publishedOn}
                />
            )}
            headerActionsContainerClassName={styles.headerActions}
            headerActions={(
                <>
                    <QuickActionLink
                        title="Edit entry"
                        to={editEntryLink}
                        variant="transparent"
                    >
                        <IoPencilOutline />
                    </QuickActionLink>
                    <QuickActionDropdownMenu
                        label={<IoBan />}
                        title="Discard entry"
                        disabled={createDiscardedEntryPending}
                        variant="transparent"
                    >
                        {discardedTags && discardedTags.map((tag) => (
                            <DropdownMenuItem
                                key={tag.name}
                                name={tag.name as DiscardedEntryTagTypeEnum}
                                onClick={handleDiscardButtonClick}
                            >
                                {tag.description ?? ''}
                            </DropdownMenuItem>
                        ))}
                    </QuickActionDropdownMenu>
                    <QuickActionButton
                        name={undefined}
                        onClick={toggleEntryCardFlipped}
                        title="flip"
                        variant="transparent"
                    >
                        <IoRepeat />
                    </QuickActionButton>
                </>
            )}
            footerIcons={isNewEntry && (
                <Tag
                    variant="complement1"
                >
                    {_ts('pillarAnalysis', 'newEntryTagLabel')}
                </Tag>
            )}
        >
            {createDiscardedEntryPending && <PendingMessage />}
            {entry && !entryCardFlipped && (
                <ExcerptInput
                    entryType={entryType}
                    image={image}
                    value={excerpt}
                    imageRaw={undefined}
                    entryAttachment={entryAttachment}
                    readOnly
                />
            )}
            {entry && entryCardFlipped && (
                <EditableEntry
                    className={styles.entryDetail}
                    entry={transformEntry(entry)}
                    entryId={entry.id}
                    leadId={entry.lead.id}
                    projectId={projectId}
                    primaryTagging={framework?.primaryTagging}
                    secondaryTagging={framework?.secondaryTagging}
                    entryImage={entry.image}
                    controlled={entry.controlled}
                    verifiedBy={entry.verifiedBy}
                    geoAreaOptions={geoAreaOptions}
                    onGeoAreaOptionsChange={setGeoAreaOptions}
                    onEntryDataChange={onEntryDataChange}
                    compact
                    noPaddingInWidgetContainer
                    entryAttachment={entryAttachment}
                />
            )}
        </DraggableContent>
    );
}

export default genericMemo(SourceEntryItem);
