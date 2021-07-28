import React from 'react';
import {
    IoClose,
    IoCheckmark,
    IoPencil,
} from 'react-icons/io5';
import { BsFileDiff } from 'react-icons/bs';
import { _cs } from '@togglecorp/fujs';
import {
    Footer,
    QuickActionButton,
    QuickActionButtonProps,
    QuickActionDropdownMenu,
    Heading,
    TextArea,
    useInputState,
    Button,
} from '@the-deep/deep-ui';

import styles from './styles.css';

interface TaggedExcerptProps<K extends string> {
    entryId: K;
    isActive?: boolean;
    onClick?: (entryId: K) => void;
    onApproveButtonClick?: QuickActionButtonProps<K>['onClick'];
    onDiscardButtonClick?: QuickActionButtonProps<K>['onClick'];
    className?: string;
    droppedExcerpt?: string;
    excerpt?: string;
    onExcerptChange?: (entryId: K, modifiedExcerpt: string) => void;
    disableApproveButton?: boolean;
    disableDiscardButton?: boolean;
}

function TaggedExcerpt<K extends string>(props: TaggedExcerptProps<K>) {
    const {
        className,
        droppedExcerpt,
        entryId,
        excerpt: excerptFromProps,
        isActive,
        onClick,
        onApproveButtonClick,
        onDiscardButtonClick,
        onExcerptChange,
        disableApproveButton,
        disableDiscardButton,
    } = props;

    const [excerpt, setExcerpt] = useInputState(excerptFromProps);

    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(entryId);
        }
    }, [entryId, onClick]);

    const handleExcerptChange = React.useCallback((modifiedExcerpt) => {
        if (onExcerptChange) {
            onExcerptChange(entryId, modifiedExcerpt);
        }
    }, [entryId, onExcerptChange]);

    return (
        <div
            className={_cs(
                styles.taggedExcerpt,
                className,
            )}
        >
            <div
                role="presentation"
                className={styles.content}
                onClick={handleClick}
            >
                {droppedExcerpt}
            </div>
            {isActive && (
                <Footer
                    quickActions={(
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
                            >
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
                                            onClick={handleExcerptChange}
                                        >
                                            Done
                                        </Button>
                                    )}
                                />
                            </QuickActionDropdownMenu>
                        </>
                    )}
                />
            )}
        </div>
    );
}

export default TaggedExcerpt;
