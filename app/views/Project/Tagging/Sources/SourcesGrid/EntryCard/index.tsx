import React, { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    IoPencil,
    IoTrash,
    IoClose,
    IoChatboxOutline,
    IoCheckmark,
} from 'react-icons/io5';
import {
    DateOutput,
    TextOutput,
    Button,
    QuickActionButton,
    Container,
} from '@the-deep/deep-ui';

import { useModalState } from '#hooks/stateManagement';
import ExcerptOutput from '#components/ExcerptOutput';
import EntryListItem from '#components/EntryListItem';
import {
    AnalysisFramework,
} from '#types/newAnalyticalFramework';

import { EntryWithLead } from '../index';
import styles from './styles.css';

interface Props {
    className?: string;
    entry: EntryWithLead;
    leadDetails: EntryWithLead['leadDetails'];
    framework: AnalysisFramework;
    viewTags?: boolean;
    onViewTagsButtonClick?: (entryId: number) => void;
    onHideTagsButtonClick?: (entryId: number) => void;
}

function EntryCard(props: Props) {
    const {
        className,
        entry,
        leadDetails,
        framework,
        viewTags,
        onViewTagsButtonClick,
        onHideTagsButtonClick,
    } = props;

    const [
        editEntryMode,
        setEditEntryMode,
        unsetEditEntryMode,
    ] = useModalState(false);

    const authorsText = useMemo(() => (
        leadDetails?.authors?.map((a) => a.title)?.join(', ')
    ), [leadDetails?.authors]);

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
                        value={leadDetails.createdOn}
                        valueType="date"
                    />
                    <TextOutput
                        label="Publisher"
                        value={leadDetails.source?.title}
                    />
                    <TextOutput
                        label="Added by"
                        value={leadDetails.createdByName}
                    />
                    <TextOutput
                        label="Author"
                        value={authorsText}
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
                        footerActions={editEntryMode ? (
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
                                <QuickActionButton
                                    className={styles.commentButton}
                                    name={entry.id}
                                >
                                    <IoChatboxOutline />
                                    <div className={styles.commentCount}>
                                        {3}
                                    </div>
                                </QuickActionButton>
                                <Button
                                    name={entry.id}
                                    variant="primary"
                                    actionsClassName={styles.verifyActions}
                                    actions={(
                                        <>
                                            <div>
                                                {1}
                                            </div>
                                            <IoCheckmark />
                                        </>
                                    )}
                                >
                                    Verify
                                </Button>
                            </>
                        )}
                    >
                        <EntryListItem
                            entry={entry}
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
