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
    QuickActionConfirmButton,
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
    excerpt?: string;
    onExcerptChange?: (modifiedExcerpt: string | undefined) => void;
}

function ExcerptModal(props: ExcerptModalProps) {
    const {
        excerpt: excerptFromProps,
        onExcerptChange,
    } = props;

    const [excerpt, setExcerpt] = useInputState(excerptFromProps);

    const handleSubmit = React.useCallback(
        () => {
            if (onExcerptChange) {
                onExcerptChange(excerpt);
            }
        },
        [onExcerptChange, excerpt],
    );

    return (
        <>
            <Heading size="small">
                Modify Excerpt
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
        onEntryDelete,
        imageRaw,
        entryImage,
        entryType,
    } = props;

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = React.useRef(null);

    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(entryId);
        }
    }, [entryId, onClick]);

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

    const handleDeleteConfirm = React.useCallback(() => {
        if (onEntryDelete) {
            onEntryDelete(entryId);
        }
    }, [entryId, onEntryDelete]);

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
                            excerpt={excerpt}
                            onExcerptChange={handleExcerptChange}
                        />
                    </QuickActionDropdownMenu>
                    <QuickActionConfirmButton
                        name={entryId}
                        onConfirm={handleDeleteConfirm}
                        message="Are you sure you want to remove this entry?"
                    >
                        <IoTrash />
                    </QuickActionConfirmButton>
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
