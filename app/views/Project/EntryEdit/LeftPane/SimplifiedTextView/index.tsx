import React, { useState, useCallback, useMemo } from 'react';
import { IoAdd } from 'react-icons/io5';
import { FaBrain } from 'react-icons/fa';
import {
    _cs,
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    Button,
} from '@the-deep/deep-ui';

import { PartialEntryType as EntryInput } from '../../schema';
import { Framework } from '../../types';
import useTextSelection from './useTextSelection';
import EntryItem from '../EntryItem';
import TextToAssistItem from '../TextToAssistItem';

import styles from './styles.css';

const CHARACTER_PER_PAGE = 10000;

type Split = {
    startIndex: number;
    endIndex: number;
    excerpt: string;
    uniqueTextId: string;
} & ({
    type: 'entry';
    entryType: EntryInput['entryType'];
    droppedExcerpt: string | undefined;
    lead: string;
    entryServerId: string | undefined;
    clientId: string;
    deleted: boolean;
} | {
    type: 'assisted';
});

interface Props {
    className?: string;
    text?: string;
    leadId: string;
    entries: EntryInput[] | undefined | null;
    onAddButtonClick?: (selectedText: string) => void;
    onAssistedEntryAdd?: (newEntry: EntryInput) => void;
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
    assistedTaggingEnabled: boolean;
    projectId: string | undefined;
    frameworkDetails: Framework;
}

function SimplifiedTextView(props: Props) {
    const {
        className,
        text: textFromProps,
        entries,
        onAddButtonClick,
        onAssistedEntryAdd,
        onExcerptChange,
        activeEntryClientId,
        assistedTaggingEnabled,
        onExcerptClick,
        onApproveButtonClick,
        leadId,
        projectId,
        onDiscardButtonClick,
        onEntryDelete,
        onEntryRestore,
        disableExcerptClick,
        disableApproveButton,
        disableDiscardButton,
        disableAddButton,
        frameworkDetails,
    } = props;

    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollTopRef = React.useRef<number | undefined>();
    const [charactersLoaded, setCharactersLoaded] = useState(CHARACTER_PER_PAGE);
    const [textToAssist, setTextToAssist] = useState<string | undefined>();

    const text = useMemo(() => {
        if (textFromProps) {
            const textLength = Math.min(textFromProps.length, charactersLoaded);
            return textFromProps.substring(0, textLength);
        }

        return '';
    }, [textFromProps, charactersLoaded]);

    // TODO: Remove overlapping splits if necessary
    const splits = useMemo(() => {
        // NOTE: Store scrollTopRef before new split is calculated
        scrollTopRef.current = containerRef.current?.scrollTop;

        const entriesSplits = entries?.map((entry) => {
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
                type: 'entry',
                uniqueTextId: entry.clientId,
                excerpt: entry.excerpt ?? entry.droppedExcerpt,
                droppedExcerpt: entry.droppedExcerpt,
                entryType: entry.entryType,
                lead: entry.lead,
                entryServerId: entry.id,
                clientId: entry.clientId,
                deleted: entry.deleted,
            });
        });

        let assistedSplit: Split | undefined;

        if (textToAssist && text) {
            const startIndex = text.indexOf(textToAssist);
            if (startIndex === -1) {
                assistedSplit = undefined;
            } else {
                assistedSplit = {
                    startIndex,
                    endIndex: startIndex + textToAssist.length,
                    type: 'assisted',
                    excerpt: textToAssist,
                    uniqueTextId: randomString(),
                };
            }
        }

        return [
            ...(entriesSplits ?? []),
            assistedSplit,
        ].filter(isDefined)
            .sort(
                (a, b) => (a.startIndex - b.startIndex),
            ) ?? [];
    }, [
        textToAssist,
        text,
        entries,
    ]);

    React.useLayoutEffect(
        () => {
            // NOTE: Set scrollTopRef on container before layout is done
            // Without this logic, the scroll randomly jumps when splits is
            // modified
            if (isDefined(scrollTopRef.current) && containerRef.current) {
                containerRef.current.scrollTop = scrollTopRef.current;
            }
            scrollTopRef.current = undefined;
        },
        [splits],
    );

    const {
        clientRect,
        isCollapsed,
        textContent,
        resetTextSelection,
    } = useTextSelection(containerRef.current ?? undefined);

    const handleAssistButtonClick = useCallback((newTextToAssist: string) => {
        resetTextSelection();
        setTextToAssist(newTextToAssist);
    }, [resetTextSelection]);

    const handleAssistedEntryAdd = useCallback((newEntry: EntryInput) => {
        if (onAssistedEntryAdd) {
            onAssistedEntryAdd(newEntry);
        }
        setTextToAssist(undefined);
    }, [onAssistedEntryAdd]);

    const handleAssistCancelButtonClick = useCallback(() => {
        setTextToAssist(undefined);
    }, []);

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
                    <React.Fragment key={split.uniqueTextId}>
                        {i > 0 && splits[i - 1].endIndex < split.startIndex && (
                            <span>
                                {text.substring(splits[i - 1].endIndex, split.startIndex)}
                            </span>
                        )}
                        {split.type === 'entry' ? (
                            <EntryItem
                                className={styles.entry}
                                clientId={split.clientId}
                                entryServerId={split.entryServerId}
                                projectId={projectId}
                                lead={split.lead}
                                entryId={split.clientId}
                                onClick={onExcerptClick}
                                disableClick={disableExcerptClick}
                                isActive={activeEntryClientId === split.clientId}
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
                        ) : (
                            <TextToAssistItem
                                textToAssist={split.excerpt}
                                onAssistedEntryAdd={handleAssistedEntryAdd}
                                leadId={leadId}
                                frameworkDetails={frameworkDetails}
                                onAssistCancel={handleAssistCancelButtonClick}
                            />
                        )}
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

    const position = useMemo(() => {
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

    const handleAddButtonClick = useCallback((selectedText: string) => {
        window.getSelection()?.removeAllRanges();

        if (onAddButtonClick) {
            onAddButtonClick(selectedText);
        }
    }, [onAddButtonClick]);

    const handleLoadMoreClick = useCallback(() => {
        setCharactersLoaded((prevValue) => (
            prevValue + CHARACTER_PER_PAGE
        ));
    }, []);

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
            {(textFromProps?.length ?? 0) > charactersLoaded && (
                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        name="load-more"
                        onClick={handleLoadMoreClick}
                    >
                        Show more
                    </Button>
                </div>
            )}
            {!isCollapsed && textContent && !disableAddButton && (
                <div
                    className={styles.actionsPopup}
                    style={position ? ({ ...position }) : undefined}
                >
                    <QuickActionButton
                        title="Add entry"
                        name={textContent}
                        variant="primary"
                        className={styles.addButton}
                        onClick={handleAddButtonClick}
                    >
                        <IoAdd />
                    </QuickActionButton>
                    { /* FIXME: Move this over to another logic */ }
                    {assistedTaggingEnabled && onAssistedEntryAdd && (
                        <QuickActionButton
                            title="Assist"
                            name={textContent}
                            variant="primary"
                            className={styles.addButton}
                            onClick={handleAssistButtonClick}
                        >
                            <FaBrain />
                        </QuickActionButton>
                    )}
                </div>
            )}
        </div>
    );
}

export default SimplifiedTextView;
