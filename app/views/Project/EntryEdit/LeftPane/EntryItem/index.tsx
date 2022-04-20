import React from 'react';
import {
    IoClose,
    IoCheckmark,
    IoPencil,
    IoArrowUndoSharp,
    IoTrashBinOutline,
} from 'react-icons/io5';
import { BsFileDiff } from 'react-icons/bs';
import { requiredStringCondition } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import {
    Tag,
    Footer,
    Container,
    QuickActionButton,
    QuickActionButtonProps,
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    Heading,
    useInputState,
    Button,
} from '@the-deep/deep-ui';

import ExcerptInput from '#components/entry/ExcerptInput';
import ExcerptTextArea from '#components/entry/ExcerptTextArea';

import { PartialEntryType as EntryInput } from '../../schema';
import EntryCommentWrapper from '#components/entryReview/EntryCommentWrapper';
import { Entry } from '../../types';

import styles from './styles.css';

interface ExcerptModalProps {
    title: string;
    excerpt?: string;
    onComplete?: (modifiedExcerpt: string | undefined) => void;
}

export function ExcerptModal(props: ExcerptModalProps) {
    const {
        title,
        excerpt: excerptFromProps,
        onComplete,
    } = props;

    const [excerpt, setExcerpt] = useInputState(excerptFromProps);

    const handleSubmit = React.useCallback(
        () => {
            if (onComplete) {
                onComplete(excerpt);
            }
        },
        [onComplete, excerpt],
    );

    return (
        <>
            <Heading size="small">
                {title}
            </Heading>
            <ExcerptTextArea
                className={styles.excerptTextArea}
                name="modified-excerpt"
                value={excerpt}
                onChange={setExcerpt}
                rows={10}
            />
            <Footer
                actions={(
                    <Button
                        name={excerpt}
                        onClick={handleSubmit}
                        disabled={requiredStringCondition(excerpt) !== undefined}
                    >
                        Done
                    </Button>
                )}
            />
        </>
    );
}

interface EntryItemProps extends EntryInput {
    entryId: string;
    isActive?: boolean;
    onClick?: (entryId: string) => void;
    onApproveButtonClick?: QuickActionButtonProps<string>['onClick'];
    onDiscardButtonClick?: QuickActionButtonProps<string>['onClick'];
    className?: string;
    onExcerptChange?: (entryId: string, modifiedExcerpt: string | undefined) => void;
    disableApproveButton?: boolean;
    disableDiscardButton?: boolean;
    onEntryDelete?: (entryId: string) => void;
    onEntryRestore?: (entryId: string) => void;
    entryImage: Entry['image'];
    disableClick?: boolean;
    errored?: boolean;
    projectId: string | undefined;
    entryServerId: string | undefined;
    draftEntry?: string;
}

function EntryItem(props: EntryItemProps) {
    const {
        className,
        entryServerId,
        droppedExcerpt,
        entryId,
        excerpt,
        isActive,
        onClick,
        projectId,
        onApproveButtonClick,
        onDiscardButtonClick,
        draftEntry,
        onExcerptChange,
        disableApproveButton,
        disableDiscardButton,
        disableClick,
        onEntryDelete,
        onEntryRestore,
        imageRaw,
        entryImage,
        entryType,
        deleted,
        errored,
        stale,
    } = props;

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = React.useRef(null);

    const handleClick = React.useCallback(() => {
        if (onClick && !disableClick) {
            onClick(entryId);
        }
    }, [entryId, onClick, disableClick]);

    const handleExcerptChange = React.useCallback(
        (modifiedExcerpt: string | undefined) => {
            if (onExcerptChange) {
                onExcerptChange(entryId, modifiedExcerpt);
            }

            if (editExcerptDropdownRef?.current) {
                editExcerptDropdownRef.current.setShowPopup(false);
            }
        },
        [entryId, onExcerptChange],
    );

    return (
        <Container
            className={_cs(
                styles.taggedExcerpt,
                className,
                isActive && styles.active,
                draftEntry && styles.createdFromAssisted,
            )}
            headingSectionClassName={styles.headingSection}
            headerActions={entryServerId && projectId && (
                <EntryCommentWrapper
                    entryId={entryServerId}
                    projectId={projectId}
                />
            )}
            footerIcons={(
                <>
                    {excerpt !== droppedExcerpt && (
                        <Tag
                            spacing="compact"
                        >
                            Edited
                        </Tag>
                    )}
                    {stale && !deleted && !errored && (
                        <Tag
                            spacing="compact"
                        >
                            Changed
                        </Tag>
                    )}
                    {deleted && (
                        <Tag
                            variant="complement2"
                            spacing="compact"
                        >
                            Deleted
                        </Tag>
                    )}
                    {errored && (
                        <Tag
                            spacing="compact"
                        >
                            Error
                        </Tag>
                    )}
                </>
            )}
            footerQuickActions={isActive && (
                <>
                    <QuickActionButton
                        title="Discard changes"
                        name={entryId}
                        onClick={onDiscardButtonClick}
                        disabled={disableDiscardButton}
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        title="Approve changes"
                        name={entryId}
                        onClick={onApproveButtonClick}
                        variant="primary"
                        disabled={disableApproveButton}
                    >
                        <IoCheckmark />
                    </QuickActionButton>
                    <QuickActionDropdownMenu
                        title="Show original excerpt"
                        label={<BsFileDiff />}
                        disabled={
                            droppedExcerpt === excerpt
                            || (droppedExcerpt?.length ?? 0) <= 0
                            || (excerpt?.length ?? 0) <= 0
                        }
                        popupClassName={styles.diffExcerptPopup}
                        popupContentClassName={styles.content}
                    >
                        {(droppedExcerpt?.length ?? 0) > 0 && (
                            <div className={styles.excerpt}>
                                <Heading size="small">
                                    Original
                                </Heading>
                                <div className={styles.text}>
                                    {droppedExcerpt}
                                </div>
                            </div>
                        )}
                        {(excerpt?.length ?? 0) > 0 && (
                            <div className={styles.excerpt}>
                                <Heading size="small">
                                    Modified
                                </Heading>
                                <div className={styles.text}>
                                    {excerpt}
                                </div>
                            </div>
                        )}
                    </QuickActionDropdownMenu>
                    <QuickActionDropdownMenu
                        label={<IoPencil />}
                        popupClassName={styles.editExcerptPopup}
                        popupContentClassName={styles.content}
                        persistent
                        componentRef={editExcerptDropdownRef}
                        title="Edit excerpt"
                    >
                        <ExcerptModal
                            title="Edit Excerpt"
                            excerpt={excerpt}
                            onComplete={handleExcerptChange}
                        />
                    </QuickActionDropdownMenu>
                    {deleted ? (
                        <QuickActionButton
                            title="Restore entry"
                            name={entryId}
                            onClick={onEntryRestore}
                        >
                            <IoArrowUndoSharp />
                        </QuickActionButton>
                    ) : (
                        <QuickActionButton
                            title="Delete entry"
                            name={entryId}
                            onClick={onEntryDelete}
                        >
                            <IoTrashBinOutline />
                        </QuickActionButton>
                    )}
                </>
            )}
            contentClassName={styles.content}
        >
            <div
                className={styles.clickableArea}
                onClick={handleClick}
                role="presentation"
            >
                <ExcerptInput
                    value={excerpt}
                    // droppedExcerpt={droppedExcerpt}
                    image={entryImage}
                    imageRaw={imageRaw}
                    // FIXME: pass this after image drag/drop is implemented
                    leadImageUrl={undefined}
                    entryType={entryType}
                    readOnly
                />
            </div>
            <div className={styles.verticalBorder} />
        </Container>
    );
}

export default EntryItem;
