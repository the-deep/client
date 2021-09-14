import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    useInputState,
    TextArea,
    Button,
    QuickActionDropdownMenu,
    QuickActionDropdownMenuProps,
    Footer,
    Heading,
    QuickActionConfirmButton,
} from '@the-deep/deep-ui';
import {
    IoPencil,
    IoTrash,
} from 'react-icons/io5';

import { PartialEntryType as EntryInput } from '../../schema';
import styles from './styles.css';

interface EntryItemProps extends EntryInput {
    isActive?: boolean;
    onClick?: (entryId: string) => void;
    onExcerptChange?: (entryId: string, modifiedExcerpt: string | undefined) => void;
    onEntryDelete?: (entryId: string) => void;
}
function EntryItem(props: EntryItemProps) {
    const {
        clientId,
        droppedExcerpt,
        excerpt: excerptFromProps,
        image,
        isActive,
        onClick,
        onExcerptChange,
        onEntryDelete,
    } = props;

    const editExcerptDropdownRef: QuickActionDropdownMenuProps['componentRef'] = React.useRef(null);
    const [excerpt, setExcerpt] = useInputState<string | undefined>(excerptFromProps);

    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(clientId);
        }
    }, [clientId, onClick]);

    const handleExcerptChange = React.useCallback(() => {
        if (onExcerptChange) {
            onExcerptChange(clientId, excerpt);
        }

        if (editExcerptDropdownRef?.current) {
            editExcerptDropdownRef.current.setShowPopup(false);
        }
    }, [clientId, excerpt, onExcerptChange]);

    const handleDeleteConfirm = React.useCallback(() => {
        if (onEntryDelete) {
            onEntryDelete(clientId);
        }
    }, [clientId, onEntryDelete]);

    return (
        <div
            role="presentation"
            className={_cs(
                isActive && styles.active,
                styles.entry,
            )}
            onClick={handleClick}
        >
            {/* FIXME: use entry output */}
            <div className={styles.excerpt}>
                {droppedExcerpt}
            </div>
            {image && (
                <img
                    className={styles.image}
                    alt={excerpt}
                    src={image}
                />
            )}
            {isActive && (
                <Footer
                    quickActions={(
                        <>
                            <QuickActionDropdownMenu
                                label={<IoPencil />}
                                popupClassName={styles.editExcerptPopup}
                                popupContentClassName={styles.content}
                                persistent
                                componentRef={editExcerptDropdownRef}
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
                                            name={undefined}
                                            onClick={handleExcerptChange}
                                        >
                                            Done
                                        </Button>
                                    )}
                                />
                            </QuickActionDropdownMenu>
                            <QuickActionConfirmButton
                                name={undefined}
                                onConfirm={handleDeleteConfirm}
                            >
                                <IoTrash />
                            </QuickActionConfirmButton>
                        </>
                    )}
                />
            )}
            <div className={styles.verticalBorder} />
        </div>
    );
}

export default EntryItem;
