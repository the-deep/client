import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { IoAdd } from 'react-icons/io5';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    QuickActionButton,
    Svg,
    Button,
} from '@the-deep/deep-ui';

import brainIcon from '#resources/img/brain.svg';
import { GeoArea } from '#components/GeoMultiSelectInput';

import { PartialEntryType as EntryInput } from '../../schema';
import { Framework } from '../../types';
import useTextSelection from './useTextSelection';
import EntryItem from '../EntryItem';
import AssistItem from '../AssistItem';

import styles from './styles.css';

const CHARACTER_PER_PAGE = 10000;

type Split = {
    startIndex: number;
    endIndex: number;
    excerpt: string;
    key: string;
} & ({
    type: 'entry';
    entryType: EntryInput['entryType'];
    droppedExcerpt: string | undefined;
    lead: string;
    entryServerId: string | undefined;
    clientId: string;
    deleted: boolean;
    draftEntry?: string;
} | {
    type: 'assisted';
});

interface Props {
    className?: string;
    text?: string;
    leadId: string;
    entries: EntryInput[] | undefined | null;
    onAddButtonClick?: (selectedText: string) => void;
    onAssistedEntryAdd?: (newEntry: EntryInput, geoAreaOptions?: GeoArea[]) => void;
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

    useEffect(() => {
        if (textToAssist && !assistedTaggingEnabled) {
            setTextToAssist(undefined);
        }
    }, [
        textToAssist,
        assistedTaggingEnabled,
    ]);

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
                key: entry.clientId,
                excerpt: entry.excerpt ?? entry.droppedExcerpt,
                droppedExcerpt: entry.droppedExcerpt,
                entryType: entry.entryType,
                lead: entry.lead,
                entryServerId: entry.id,
                clientId: entry.clientId,
                deleted: entry.deleted,
                draftEntry: entry.draftEntry,
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
                    key: 'assist-key',
                };
            }
        }

        return [
            ...(entriesSplits ?? []),
            assistedSplit,
        ]
            .filter(isDefined)
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
        // FIXME: Look into if the ref is working correctly
    } = useTextSelection(containerRef.current ?? undefined);

    const handleAssistButtonClick = useCallback((newTextToAssist: string) => {
        resetTextSelection();
        setTextToAssist(newTextToAssist);
    }, [resetTextSelection]);

    const handleAssistedEntryAdd = useCallback((
        newEntry: EntryInput,
        geoAreaOptions?: GeoArea[],
    ) => {
        if (onAssistedEntryAdd) {
            onAssistedEntryAdd(newEntry, geoAreaOptions);
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
                    <React.Fragment key={split.key}>
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
                                draftEntry={split.draftEntry}
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
                            <AssistItem
                                text={split.excerpt}
                                projectId={projectId}
                                onAssistedEntryAdd={handleAssistedEntryAdd}
                                leadId={leadId}
                                frameworkDetails={frameworkDetails}
                                onAssistCancel={handleAssistCancelButtonClick}
                                disabled={disableExcerptClick}
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
                assistedTaggingEnabled && styles.assistedEnabled,
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
                    {assistedTaggingEnabled ? (
                        <>
                            <QuickActionButton
                                title="Add entry"
                                name={textContent}
                                variant="primary"
                                className={styles.addButton}
                                onClick={handleAddButtonClick}
                            >
                                <IoAdd />
                            </QuickActionButton>
                            <QuickActionButton
                                title="Assist"
                                name={textContent}
                                variant="nlp-primary"
                                className={styles.addButton}
                                onClick={handleAssistButtonClick}
                            >
                                <Svg
                                    className={styles.brainIcon}
                                    src={brainIcon}
                                />
                            </QuickActionButton>
                        </>
                    ) : (
                        <QuickActionButton
                            title="Add entry"
                            name={textContent}
                            variant="primary"
                            className={styles.addButton}
                            onClick={handleAddButtonClick}
                        >
                            <IoAdd />
                        </QuickActionButton>
                    )}
                </div>
            )}
        </div>
    );
}

export default SimplifiedTextView;
