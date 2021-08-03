import React from 'react';
import { IoAddCircle } from 'react-icons/io5';
import { _cs, isDefined } from '@togglecorp/fujs';
import { Button } from '@the-deep/deep-ui';

import useTextSelection from './useTextSelection';
import TaggedExcerpt from './TaggedExcerpt';
import styles from './styles.css';

export interface Entry {
    clientId: string;
    droppedExcerpt: string;
    excerpt: string;
}

interface Split {
    startIndex: number;
    endIndex: number;
    excerpt: string;
    droppedExcerpt: string;
}

interface Props {
    className?: string;
    text?: string;
    entries?: Entry[];
    onAddButtonClick?: (selectedText: string) => void;
    onExcerptChange?: (entryClientId: Entry['clientId'], newExcerpt: string) => void;
    activeEntryClientId?: Entry['clientId'];
    onExcerptClick?: (entryClientId: Entry['clientId']) => void;
    onApproveButtonClick?: (entryClientId: Entry['clientId']) => void;
    onDiscardButtonClick?: (entryClientId: Entry['clientId']) => void;
    disableApproveButton?: boolean;
    disableDiscardButton?: boolean;
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
        onDiscardButtonClick,
        disableApproveButton,
        disableDiscardButton,
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
            });
        })
            .filter(isDefined)
            .sort((a: Split, b: Split) => (
                a.startIndex - b.startIndex
            )) ?? []
    ), [text, entries]);

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
                    <React.Fragment key={split.startIndex}>
                        {i > 0 && splits[i - 1].endIndex < split.startIndex && (
                            <span>
                                {text.substring(splits[i - 1].endIndex, split.startIndex)}
                            </span>
                        )}
                        <TaggedExcerpt
                            entryId={split.entryId}
                            onClick={onExcerptClick}
                            isActive={activeEntryClientId === split.entryId}
                            excerpt={split.excerpt}
                            droppedExcerpt={split.droppedExcerpt}
                            onExcerptChange={onExcerptChange}
                            onApproveButtonClick={onApproveButtonClick}
                            onDiscardButtonClick={onDiscardButtonClick}
                            disableApproveButton={disableApproveButton}
                            disableDiscardButton={disableDiscardButton}
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

    return (
        <div
            ref={containerRef}
            className={_cs(styles.simplifiedTextView, className)}
        >
            {children}
            {!isCollapsed && textContent && (
                <div
                    className={styles.actionsPopup}
                    style={position ? ({ ...position }) : undefined}
                >
                    <Button
                        name={textContent}
                        variant="action"
                        className={styles.addButton}
                        onClick={onAddButtonClick}
                    >
                        <IoAddCircle className={styles.addIcon} />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default SimplifiedTextView;
