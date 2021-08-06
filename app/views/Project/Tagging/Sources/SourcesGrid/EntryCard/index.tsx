import React from 'react';
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

import styles from './styles.css';

interface Entry {
    id: string;
    sourceTitle?: string;
    sourceCreatedOn?: string;
    excerpt?: string;
    sourcePublishedOn?: string;
    sourceCreatedByDisplay?: string;
    sourceAuthor?: string;
    sourcePublisher?: string;
}

interface Props {
    className?: string;
    entry: Entry
    viewTags?: boolean;
    onViewTagsButtonClick?: (entryId: string) => void;
    onHideTagsButtonClick?: (entryId: string) => void;
}

function EntyrCard(props: Props) {
    const {
        className,
        entry,
        viewTags,
        onViewTagsButtonClick,
        onHideTagsButtonClick,
    } = props;

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
                heading={entry.sourceTitle}
                headingSize="small"
                headerDescription={entry.sourcePublishedOn && (
                    <DateOutput
                        value={entry.sourcePublishedOn}
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
                <div>
                    {entry.excerpt}
                </div>
                <div className={styles.metaSection}>
                    <TextOutput
                        label="Added on"
                        value={entry.sourceCreatedOn}
                        valueType="date"
                    />
                    <TextOutput
                        label="Publisher"
                        value={entry.sourcePublisher}
                    />
                    <TextOutput
                        label="Added by"
                        value={entry.sourceCreatedByDisplay}
                    />
                    <TextOutput
                        label="Author"
                        value={entry.sourceAuthor}
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
                                <Button
                                    name={entry.id}
                                    variant="secondary"
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
                        Tags
                    </Container>
                </>
            )}
        </div>
    );
}

export default EntyrCard;
