import React, { useState, useMemo, useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoPencil,
    IoTrash,
    IoClose,
} from 'react-icons/io5';
import {
    DateOutput,
    TextOutput,
    Button,
    QuickActionButton,
    Container,
} from '@the-deep/deep-ui';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';
import ExcerptOutput from '#components/entry/ExcerptOutput';
import EntryInput from '#components/entry/EntryInput';
// import EntryVerification from '#components/entryReview/EntryVerification';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import { EntryInput as EntryInputType } from '#views/Project/EntryEdit/types';

import { Framework, Entry } from '../types';

import styles from './styles.css';

function transformEntry(entry: Entry): EntryInputType {
    return removeNull({
        ...entry,
        lead: entry.lead.id,
        image: entry.image?.id,
    });
}

interface Props {
    className?: string;
    entry: Entry;
    leadDetails: Entry['lead'];
    projectId: string;
    framework: Framework | undefined | null;
    tagsVisible?: boolean;
    onViewTagsButtonClick?: (entryId: string) => void;
    onHideTagsButtonClick?: (entryId: string) => void;
}

function EntryCard(props: Props) {
    const {
        className,
        entry: entryFromProps,
        leadDetails,
        framework,
        projectId,
        tagsVisible,
        onViewTagsButtonClick,
        onHideTagsButtonClick,
    } = props;

    const [entry, setEntry] = useState<Entry>(entryFromProps);

    const [
        editEntryMode,
        setEditEntryMode,
        unsetEditEntryMode,
    ] = useModalState(false);

    const {
        pending,
        trigger: getEntry,
    } = useLazyRequest<Entry, number>({
        url: (ctx) => `server://v2/entries/${ctx}/`,
        method: 'GET',
        onSuccess: (response) => {
            setEntry(response);
        },
        failureHeader: 'Entry',
    });

    const handleChange = useCallback(
        (value: unknown) => {
            // FIXME: handle here
            // eslint-disable-next-line no-console
            console.warn('Should set value to', value);
        },
        [],
    );

    const authorsDetailText = useMemo(() => (
        leadDetails?.authors?.map((a) => a.title)?.join(', ')
    ), [leadDetails?.authors]);

    return (
        <div
            className={_cs(
                styles.entryCard,
                className,
                tagsVisible && styles.expanded,
            )}
        >
            <Container
                className={styles.sourceDetails}
                heading={leadDetails.title}
                headingSize="small"
                headerDescription={(
                    <DateOutput
                        value={leadDetails.publishedOn}
                    />
                )}
                footerQuickActions={(
                    <>
                        <QuickActionButton name={undefined}>
                            <IoPencil />
                        </QuickActionButton>
                        <QuickActionButton name={undefined}>
                            <IoTrash />
                        </QuickActionButton>
                    </>
                )}
                footerActions={(
                    <Button
                        name={entry.id}
                        disabled={tagsVisible}
                        onClick={onViewTagsButtonClick}
                    >
                        View tags
                    </Button>
                )}
            >
                <ExcerptOutput
                    entryType={entry.entryType}
                    excerpt={entry.excerpt}
                    image={entry.image}
                    droppedExcerpt={entry.droppedExcerpt}
                    // tabularFieldData={entry.tabularFieldData}
                />
                <div className={styles.metaSection}>
                    <TextOutput
                        label="Added on"
                        value={leadDetails.createdAt}
                        valueType="date"
                    />
                    <TextOutput
                        label="Publisher"
                        value={leadDetails.source?.title}
                    />
                    <TextOutput
                        label="Added by"
                        value={leadDetails.createdBy?.displayName}
                    />
                    <TextOutput
                        label="Author"
                        value={authorsDetailText}
                    />
                </div>
            </Container>
            {tagsVisible && (
                <>
                    <div className={styles.verticalSeparator} />
                    <Container
                        className={styles.tagsContainer}
                        headerActions={(
                            <Button
                                name={entry.id}
                                onClick={onHideTagsButtonClick}
                                variant="action"
                            >
                                <IoClose />
                            </Button>
                        )}
                        footerActions={(
                            <>
                                {editEntryMode ? (
                                    <>
                                        <Button
                                            name={entry.id}
                                            variant="secondary"
                                            onClick={unsetEditEntryMode}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            name={entry.id}
                                            variant="secondary"
                                            onClick={unsetEditEntryMode}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            name={entry.id}
                                            variant="secondary"
                                            onClick={setEditEntryMode}
                                            icons={(
                                                <IoPencil />
                                            )}
                                        >
                                            Edit Tags
                                        </Button>
                                        <EntryComments
                                            // FIXME: Remove cast after entry comments
                                            // is switched to gql
                                            entryId={+entry.id}
                                            projectId={+projectId}
                                        />
                                        {/*
                                        <EntryVerification
                                            entryId={entry.id}
                                            projectId={projectId}
                                            verifiedBy={entry.verifiedBy}
                                            onVerificationChange={getEntry}
                                            disabled={pending}
                                        />
                                        */}
                                    </>
                                )}
                                <EntryControl
                                    // FIXME: Remove cast after entry comments
                                    // is switched to gql
                                    entryId={+entry.id}
                                    projectId={+projectId}
                                    value={!!entry.controlled}
                                    onChange={getEntry}
                                    disabled={pending}
                                />
                            </>
                        )}
                    >
                        <EntryInput
                            name={undefined}
                            value={transformEntry(entry)}
                            onChange={handleChange}
                            hideExcerpt
                            primaryTagging={framework?.primaryTagging}
                            secondaryTagging={framework?.secondaryTagging}
                            className={styles.entryTags}
                            sectionContainerClassName={styles.section}
                            secondaryTaggingContainerClassName={styles.section}
                            readOnly={!editEntryMode}
                        />
                    </Container>
                </>
            )}
        </div>
    );
}

export default EntryCard;
