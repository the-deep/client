import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { _cs, isDefined } from '@togglecorp/fujs';
import { QuickActionButton } from '@the-deep/deep-ui';

import { PartialEntryType as EntryInput } from '../../schema';
import useTextSelection from './useTextSelection';
import EntryItem from '../EntryItem';
import styles from './styles.css';

interface Split {
    startIndex: number;
    endIndex: number;
    excerpt: string | undefined;
    droppedExcerpt: string | undefined;
}

interface Props {
    className?: string;
    text?: string;
    entries: EntryInput[] | undefined | null;
    onAddButtonClick?: (selectedText: string) => void;
    onExcerptChange?: (entryClientId: string, newExcerpt: string | undefined) => void;
    activeEntryClientId?: string;
    onExcerptClick?: (entryClientId: string) => void;
    onApproveButtonClick?: (entryClientId: string) => void;
    onDiscardButtonClick?: (entryClientId: string) => void;
    onEntryDelete?: (entryId: string) => void;
    onEntryRestore?: (entryId: string) => void;
    disableExcerptClick?: boolean;
    disableApproveButton?: boolean;
    disableDiscardButton?: boolean;
    disableAddButton?: boolean;
    projectId: string | undefined;
}

function SimplifiedTextView(props: Props) {
    const {
        className,
        text,
        entries,
        onAddButtonClick,
        onExcerptChange,
        activeEntryClientId,
        onExcerptClick,
        onApproveButtonClick,
        projectId,
        onDiscardButtonClick,
        onEntryDelete,
        onEntryRestore,
        disableExcerptClick,
        disableApproveButton,
        disableDiscardButton,
        disableAddButton,
    } = props;

    // TODO: Remove overlapping splits if necessary
    const splits = React.useMemo(() => (
        entries?.map((entry) => {
            if (!text || !entry.droppedExcerpt) {
                return null;
            }

            const startIndex = text.indexOf(entry.droppedExcerpt);
            if (startIndex === -1) {
                return null;
            }

            const endIndex = startIndex + entry.droppedExcerpt.length;

            return ({
                startIndex,
                endIndex,
                entryId: entry.clientId,
                excerpt: entry.excerpt,
                droppedExcerpt: entry.droppedExcerpt,
                entryType: entry.entryType,
                lead: entry.lead,
                entryServerId: entry.id,
                clientId: entry.clientId,
                deleted: entry.deleted,
            });
        })
            .filter(isDefined)
            .sort((a: Split, b: Split) => (
                a.startIndex - b.startIndex
            )) ?? []
    ), [
        text,
        entries,
    ]);

    let children: React.ReactNode = null;
    if (!text || splits.length === 0) {
        children = text;
    } else {
        const firstSplit = splits[0];
        const lastSplit = splits[splits.length - 1];
        children = (
            <>
                {firstSplit.startIndex > 0 && (
                    <span>
                        {text.substring(0, firstSplit.startIndex)}
                    </span>
                )}
                {splits.map((split, i) => (
                    <React.Fragment key={split.entryId}>
                        {i > 0 && splits[i - 1].endIndex < split.startIndex && (
                            <span>
                                {text.substring(splits[i - 1].endIndex, split.startIndex)}
                            </span>
                        )}
                        <EntryItem
                            className={styles.entry}
                            clientId={split.clientId}
                            entryServerId={split.entryServerId}
                            projectId={projectId}
                            lead={split.lead}
                            entryId={split.entryId}
                            onClick={onExcerptClick}
                            disableClick={disableExcerptClick}
                            isActive={activeEntryClientId === split.entryId}
                            excerpt={split.excerpt}
                            deleted={split.deleted}
                            entryType={split.entryType}
                            droppedExcerpt={split.droppedExcerpt}
                            onExcerptChange={onExcerptChange}
                            onEntryDelete={onEntryDelete}
                            onEntryRestore={onEntryRestore}
                            onApproveButtonClick={onApproveButtonClick}
                            onDiscardButtonClick={onDiscardButtonClick}
                            disableApproveButton={disableApproveButton}
                            disableDiscardButton={disableDiscardButton}
                            entryImage={undefined}
                        />
                    </React.Fragment>
                ))}
                {lastSplit.endIndex < text.length && (
                    <span>
                        {text.substring(lastSplit.endIndex, text.length)}
                    </span>
                )}
            </>
        );
    }

    const containerRef = React.useRef<HTMLDivElement>(null);

    const {
        clientRect,
        isCollapsed,
        textContent,
    } = useTextSelection(containerRef.current ?? undefined);

    const position = React.useMemo(() => {
        const parent = containerRef.current;
        if (!clientRect || !parent) {
            return undefined;
        }

        const parentRect = parent.getBoundingClientRect();

        const right = parentRect.width - clientRect.width - clientRect.left + parentRect.left;
        const parentHalfWidth = (parentRect.left + parentRect.width) / 2;

        const pos = {
            top: clientRect.top - parentRect.top + parent.scrollTop + clientRect.height,
            right: clientRect.right < parentHalfWidth ? 'unset' : right,
            left: clientRect.right < parentHalfWidth ? (clientRect.right - parentRect.left) : 'unset',
        };

        return pos;
    }, [clientRect]);

    const handleAddButtonClick = React.useCallback((selectedText: string) => {
        window.getSelection()?.removeAllRanges();

        if (onAddButtonClick) {
            onAddButtonClick(selectedText);
        }
    }, [onAddButtonClick]);

    return (
        <div
            ref={containerRef}
            className={_cs(
                styles.simplifiedTextView,
                className,
                disableAddButton && styles.disabled,
            )}
        >
            {children}
            {!isCollapsed && textContent && !disableAddButton && (
                <div
                    className={styles.actionsPopup}
                    style={position ? ({ ...position }) : undefined}
                >
                    <QuickActionButton
                        name={textContent}
                        variant="primary"
                        className={styles.addButton}
                        onClick={handleAddButtonClick}
                    >
                        <IoAdd />
                    </QuickActionButton>
                </div>
            )}
        </div>
    );
}

export default SimplifiedTextView;
