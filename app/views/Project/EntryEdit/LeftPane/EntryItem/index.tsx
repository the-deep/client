import React from 'react';
import {
    IoClose,
    IoCheckmark,
    IoPencil,
    IoTrash,
} from 'react-icons/io5';
import { BsFileDiff } from 'react-icons/bs';
import { requiredStringCondition } from '@togglecorp/toggle-form';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    Container,
    QuickActionButton,
    QuickActionButtonProps,
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    Heading,
    TextArea,
    useInputState,
    Button,
} from '@the-deep/deep-ui';

import ExcerptOutput from '#components/entry/ExcerptOutput';

import { PartialEntryType as EntryInput } from '../../schema';
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
            <TextArea
                className={styles.excerptTextArea}
                name="modified-excerpt"
                value={excerpt}
                onChange={setExcerpt}
                rows={4}
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
    entryImage: Entry['image'];
    disableClick?: boolean,
}

function EntryItem(props: EntryItemProps) {
    const {
        className,
        droppedExcerpt,
        entryId,
        excerpt,
        isActive,
        onClick,
        onApproveButtonClick,
        onDiscardButtonClick,
        onExcerptChange,
        disableApproveButton,
        disableDiscardButton,
        disableClick,
        onEntryDelete,
        imageRaw,
        entryImage,
        entryType,
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
            )}
            footerQuickActions={isActive && (
                <>
                    <QuickActionButton
                        name={entryId}
                        onClick={onDiscardButtonClick}
                        disabled={disableDiscardButton}
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        name={entryId}
                        onClick={onApproveButtonClick}
                        variant="primary"
                        disabled={disableApproveButton}
                    >
                        <IoCheckmark />
                    </QuickActionButton>
                    <QuickActionDropdownMenu
                        label={<BsFileDiff />}
                        disabled={droppedExcerpt === excerpt}
                        popupClassName={styles.diffExcerptPopup}
                        popupContentClassName={styles.content}
                    >
                        <div className={styles.excerpt}>
                            <Heading size="small">
                                Original
                            </Heading>
                            <div className={styles.text}>
                                {droppedExcerpt}
                            </div>
                        </div>
                        <div className={styles.excerpt}>
                            <Heading size="small">
                                Modified
                            </Heading>
                            <div className={styles.text}>
                                {excerpt}
                            </div>
                        </div>
                    </QuickActionDropdownMenu>
                    <QuickActionDropdownMenu
                        label={<IoPencil />}
                        popupClassName={styles.editExcerptPopup}
                        popupContentClassName={styles.content}
                        persistent
                        componentRef={editExcerptDropdownRef}
                    >
                        <ExcerptModal
                            title="Edit Excerpt"
                            excerpt={excerpt}
                            onComplete={handleExcerptChange}
                        />
                    </QuickActionDropdownMenu>
                    <QuickActionButton
                        name={entryId}
                        onClick={onEntryDelete}
                    >
                        <IoTrash />
                    </QuickActionButton>
                </>
            )}
        >
            <div
                onClick={handleClick}
                role="presentation"
            >
                <ExcerptOutput
                    excerpt={excerpt}
                    droppedExcerpt={droppedExcerpt}
                    image={entryImage}
                    imageRaw={imageRaw}
                    // FIXME: pass this after image drag/drop is implemented
                    leadImageUrl={undefined}
                    entryType={entryType}
                />
                {excerpt !== droppedExcerpt && (
                    <div>
                        (Edited)
                    </div>
                )}
            </div>
            <div className={styles.verticalBorder} />
        </Container>
    );
}

export default EntryItem;
