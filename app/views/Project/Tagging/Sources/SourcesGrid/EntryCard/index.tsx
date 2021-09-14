import React, { useMemo } from 'react';
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

import ExcerptOutput from '#components/entry/ExcerptOutput';
// import EntryVerification from '#components/entryReview/EntryVerification';
import EditableEntry from '../../components/EditableEntry';

import { Framework, Entry } from '../types';

import styles from './styles.css';

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
        entry,
        leadDetails,
        framework,
        projectId,
        tagsVisible,
        onViewTagsButtonClick,
        onHideTagsButtonClick,
    } = props;

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
                    <Button
                        className={styles.closeButton}
                        name={entry.id}
                        onClick={onHideTagsButtonClick}
                        variant="action"
                    >
                        <IoClose />
                    </Button>
                    <div className={styles.verticalSeparator} />
                    <EditableEntry
                        className={styles.entry}
                        entry={entry}
                        projectId={projectId}
                        framework={framework}
                        compact
                    />
                </>
            )}
        </div>
    );
}

export default EntryCard;
