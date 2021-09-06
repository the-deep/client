import React, { useState, useMemo } from 'react';
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

import { useModalState } from '#hooks/stateManagement';
import { useLazyRequest } from '#base/utils/restRequest';
import ExcerptOutput from '#components/entry/ExcerptOutput';
import EntryListItem from '#components/entry/EntryListItem';
import EntryVerification from '#components/entryReview/EntryVerification';
import EntryComments from '#components/entryReview/EntryComments';
import EntryControl from '#components/entryReview/EntryControl';
import {
    AnalysisFramework,
} from '#types/newAnalyticalFramework';
import { Entry } from '#types/newEntry';
import { entry1 } from '#views/Project/Tagging/mockData';

import styles from './styles.css';

interface Props {
    className?: string;
    entry: Entry;
    leadDetails: Entry['lead'];
    projectId: number;
    framework: AnalysisFramework;
    viewTags?: boolean;
    onViewTagsButtonClick?: (entryId: number) => void;
    onHideTagsButtonClick?: (entryId: number) => void;
}

function EntryCard(props: Props) {
    const {
        className,
        entry: entryFromProps,
        leadDetails,
        framework,
        projectId,
        viewTags,
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

    const authorsDetailText = useMemo(() => (
        leadDetails?.authorsDetail?.map((a) => a.title)?.join(', ')
    ), [leadDetails?.authorsDetail]);

    return (
        <div
            className={_cs(
                styles.entryCard,
                className,
                viewTags && styles.expanded,
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
                        disabled={viewTags}
                        onClick={onViewTagsButtonClick}
                    >
                        View tags
                    </Button>
                )}
            >
                <ExcerptOutput
                    entryType={entry.entryType}
                    excerpt={entry.excerpt}
                    imageDetails={entry.imageDetails}
                    tabularFieldData={entry.tabularFieldData}
                />
                <div className={styles.metaSection}>
                    <TextOutput
                        label="Added on"
                        value={leadDetails.createdAt}
                        valueType="date"
                    />
                    <TextOutput
                        label="Publisher"
                        value={leadDetails.sourceDetail?.title}
                    />
                    <TextOutput
                        label="Added by"
                        value={leadDetails.createdByName}
                    />
                    <TextOutput
                        label="Author"
                        value={authorsDetailText}
                    />
                </div>
            </Container>
            {viewTags && (
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
                                            entryId={entry.id}
                                            projectId={projectId}
                                        />
                                        <EntryVerification
                                            entryId={entry.id}
                                            projectId={entry.project}
                                            verifiedBy={entry.verifiedBy}
                                            onVerificationChange={getEntry}
                                            disabled={pending}
                                        />
                                    </>
                                )}
                                <EntryControl
                                    entryId={entry.id}
                                    projectId={entry.project}
                                    value={entry.controlled}
                                    onChange={getEntry}
                                    disabled={pending}
                                />
                            </>
                        )}
                    >
                        <EntryListItem
                            entry={entry1}
                            hideExcerpt
                            framework={framework}
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
