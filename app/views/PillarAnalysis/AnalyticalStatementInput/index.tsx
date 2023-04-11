import React, { useCallback } from 'react';
import {
    IoClose,
    IoCheckmarkCircleSharp,
    IoEllipseOutline,
    IoBarChartSharp,
} from 'react-icons/io5';
import { GrDrag } from 'react-icons/gr';
import { useParams } from 'react-router-dom';

import {
    _cs,
    isDefined,
    isNotDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    Container,
    DropContainer,
    QuickActionButton,
    TextArea,
    useAlert,
} from '@the-deep/deep-ui';
import {
    useFormArray,
    useFormObject,
    SetValueArg,
    Error,
    getErrorObject,
} from '@togglecorp/toggle-form';
import { gql, useMutation } from '@apollo/client';
import {
    AutomaticStoryAnalysisMutation,
    AutomaticStoryAnalysisMutationVariables,
} from '#generated/types';

import { useModalState } from '#hooks/stateManagement';
import NonFieldError from '#components/NonFieldError';
import { GeoArea } from '#components/GeoMultiSelectInput';
import { Attributes, Listeners } from '#components/SortableList';
import { reorder, genericMemo } from '#utils/common';

import {
    AnalyticalStatementType,
    PartialAnalyticalEntryType,
    PartialAnalyticalStatementType,
} from '../schema';

import { Framework } from '..';
import AnalyticalEntryInput from './AnalyticalEntryInput';

import StoryAnalysisModal from './StoryAnalysisModal';
import styles from './styles.css';

export const ENTRIES_LIMIT = 50;

export interface DroppedValue {
    entryId: string;
    statementClientId?: string;
}

export interface AnalyticalStatementInputProps {
    className?: string;
    value: PartialAnalyticalStatementType;
    error: Error<AnalyticalStatementType> | undefined;
    onChange: (value: SetValueArg<PartialAnalyticalStatementType>, index: number) => void;
    onRemove: (index: number) => void;
    onEntryMove: (entryId: string, statementClientId: string) => void;
    onEntryDrop: (entryId: string) => void;
    index: number;
    isBeingDragged?: boolean;
    attributes?: Attributes;
    listeners?: Listeners;
    onSelectedNgramChange: (item: string | undefined) => void;
    framework: Framework;
    geoAreaOptions: GeoArea[] | undefined | null;
    setGeoAreaOptions: React.Dispatch<React.SetStateAction<GeoArea[] | undefined | null>>;
    onEntryDataChange: () => void;
}

const defaultVal = (): AnalyticalStatementType => ({
    statement: '',
    order: -1,
    clientId: `auto-${randomString()}`,
    entries: [],
});

const AUTOMATIC_STORY_ANALYSIS = gql`
    mutation AutomaticStoryAnalysis($projectId: ID!, $entriesId: [ID!]) {
        project(id: $projectId) {
            triggerAutomaticNgram(data: {entriesId: $entriesId}) {
                errors
                ok
                result {
                    id
                    status
                    unigrams {
                        count
                        word
                    }
                    bigrams {
                        count
                        word
                    }
                    trigrams {
                        count
                        word
                    }
                }
            }
            triggerAutomaticSummary(data: {entriesId: $entriesId}) {
                errors
                ok
                result {
                    id
                    status
                    summary
                }
            }
        }
    }
`;

function AnalyticalStatementInput(props: AnalyticalStatementInputProps) {
    const {
        className,
        value,
        error: riskyError,
        onChange,
        onRemove,
        onEntryMove,
        onEntryDrop,
        index,
        attributes,
        listeners,
        framework,
        geoAreaOptions,
        setGeoAreaOptions,
        onEntryDataChange,
    } = props;

    const alert = useAlert();

    const onFieldChange = useFormObject(index, onChange, defaultVal);
    const {
        projectId,
    } = useParams<{ projectId: string}>();

    const error = getErrorObject(riskyError);
    const arrayError = getErrorObject(error?.entries);

    const [
        moreDetailsModalShown,
        showStoryAnalysisModal,
        hideStoryAnalysisModal,
    ] = useModalState(false);

    const [
        createAutomaticStoryAnalysis,
        {
            data: automaticStoryAnalysis,
        },
    ] = useMutation<AutomaticStoryAnalysisMutation, AutomaticStoryAnalysisMutationVariables>(
        AUTOMATIC_STORY_ANALYSIS,
        {
            onCompleted: (response) => {
                if (!response || !response.project?.triggerAutomaticNgram
                    || !response.project?.triggerAutomaticSummary) {
                    return;
                }

                if (response.project.triggerAutomaticSummary.errors) {
                    alert.show(
                        'There were errors when creating automatic summary.',
                        { variant: 'error' },
                    );
                }
                if (response.project.triggerAutomaticNgram.errors) {
                    alert.show(
                        'There were errors when creating automatic Ngram.',
                        { variant: 'error' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Failed to create automatic story analysis.',
                    { variant: 'error' },
                );
            },
        },
    );

    const handleStoryAnalysisModalOpen = useCallback(() => {
        createAutomaticStoryAnalysis({
            variables: {
                projectId,
                entriesId: value.entries?.map((ae) => ae.entry).filter(isDefined),
            },
        });
        showStoryAnalysisModal();
    }, [value.entries, showStoryAnalysisModal, projectId, createAutomaticStoryAnalysis]);

    const {
        // setValue: onAnalyticalEntryChange,
        removeValue: onAnalyticalEntryRemove,
    } = useFormArray('entries', onFieldChange);

    type AnalyticalEntry = typeof value.entries;

    const handleAnalyticalEntryDrop = useCallback(
        (dropValue: DroppedValue, dropOverEntryClientId?: string) => {
            onFieldChange(
                (oldEntries: AnalyticalEntry) => {
                    // NOTE: Treat moved item as a new item by removing the old one and
                    // adding the new one again
                    const movedItem = value.entries
                        ?.find((item) => item.entry === dropValue.entryId);

                    // NOTE: Don't let users add more that certain items
                    if (
                        isNotDefined(movedItem)
                        && (value?.entries?.length ?? 0) >= ENTRIES_LIMIT
                    ) {
                        return oldEntries;
                    }

                    const newAnalyticalEntries = [...(oldEntries ?? [])];

                    const clientId = randomString();
                    let newAnalyticalEntry: PartialAnalyticalEntryType = {
                        clientId,
                        entry: dropValue.entryId,
                        order: value.order ?? 1,
                    };

                    if (value.entries && isDefined(movedItem)) {
                        newAnalyticalEntry = {
                            ...movedItem,
                            order: value.order ?? 1,
                        };
                        const movedItemOldIndex = value.entries
                            .findIndex((item) => item.entry === dropValue.entryId);
                        newAnalyticalEntries.splice(movedItemOldIndex, 1);
                    }

                    if (dropOverEntryClientId) {
                        const currentIndex = newAnalyticalEntries
                            .findIndex((v) => v.clientId === dropOverEntryClientId);
                        newAnalyticalEntries.splice(currentIndex, 0, newAnalyticalEntry);
                    } else {
                        newAnalyticalEntries.push(newAnalyticalEntry);
                    }

                    // NOTE: After the newly added entry's order is set and
                    // placed in the desired index, we can change the order of
                    // whole list in bulk
                    return reorder(newAnalyticalEntries);
                },
                'entries' as const,
            );
            if (
                isDefined(dropValue.statementClientId)
                && (dropValue.statementClientId !== value.clientId)
            ) {
                // NOTE: Remove entry from old statement if it was moved from
                // one statement to another statement
                onEntryMove(dropValue.entryId, dropValue.statementClientId);
            }
            onEntryDrop(dropValue.entryId);
        },
        [
            onEntryDrop, onFieldChange, onEntryMove,
            value.entries, value.order, value.clientId,
        ],
    );

    const handleAnalyticalEntryAdd = useCallback(
        (val: Record<string, unknown> | undefined) => {
            if (!val) {
                return;
            }
            const typedVal = val as { entryId: string, statementClientId: string };
            handleAnalyticalEntryDrop(typedVal);
        },
        [handleAnalyticalEntryDrop],
    );

    const handleIncludeInReportChange = useCallback(() => {
        onFieldChange((oldVal?: boolean) => !oldVal, 'includeInReport' as const);
    }, [onFieldChange]);

    const handleStatementChange = useCallback((newStatementVal: string | undefined) => {
        onFieldChange(newStatementVal, 'statement');
    }, [onFieldChange]);

    return (
        <Container
            className={_cs(styles.analyticalStatementInput, className)}
            contentClassName={styles.dragContent}
            headerClassName={styles.header}
            headerDescription={(
                <div className={styles.headerDescription}>
                    <NonFieldError error={error} />
                    <TextArea
                        className={styles.statement}
                        // FIXME: use translation
                        placeholder="Enter analytical statement"
                        name="statement"
                        rows={4}
                        value={value.statement}
                        onChange={onFieldChange}
                        error={error?.statement}
                    />
                </div>
            )}
            headerIcons={(
                <>
                    <QuickActionButton
                        title="Include in report"
                        name="includeInReport"
                        onClick={handleIncludeInReportChange}
                        big
                    >
                        {(value.includeInReport
                            ? <IoCheckmarkCircleSharp />
                            : <IoEllipseOutline />
                        )}
                    </QuickActionButton>
                    <QuickActionButton
                        name="View more details modal"
                        onClick={handleStoryAnalysisModalOpen}
                        big
                    >
                        <IoBarChartSharp />
                    </QuickActionButton>
                </>
            )}
            // actionsContainerClassName={styles.actionsContainer}
            headerActions={(
                <>
                    <QuickActionButton
                        name={index}
                        onClick={onRemove}
                        // FIXME: use translation
                        title="Remove Analytical Statement"
                    >
                        <IoClose />
                    </QuickActionButton>
                    <QuickActionButton
                        name={index}
                        // FIXME: use translation
                        title="Drag"
                        {...attributes}
                        {...listeners}
                    >
                        <GrDrag />
                    </QuickActionButton>
                </>
            )}
        >
            <div className={styles.entryContainer}>
                {value.entries?.map((analyticalEntry, myIndex) => (
                    <AnalyticalEntryInput
                        key={analyticalEntry.clientId}
                        index={myIndex}
                        statementClientId={value.clientId}
                        value={analyticalEntry}
                        projectId={projectId}
                        // onChange={onAnalyticalEntryChange}
                        onRemove={onAnalyticalEntryRemove}
                        error={(
                            analyticalEntry.clientId
                                ? arrayError?.[analyticalEntry.clientId] : undefined
                        )}
                        onAnalyticalEntryDrop={handleAnalyticalEntryDrop}
                        framework={framework}
                        geoAreaOptions={geoAreaOptions}
                        setGeoAreaOptions={setGeoAreaOptions}
                        onEntryDataChange={onEntryDataChange}
                    />
                ))}
            </div>
            {moreDetailsModalShown && (
                <StoryAnalysisModal
                    onModalClose={hideStoryAnalysisModal}
                    onSave={handleStatementChange}
                    statementId={value.clientId}
                    analyticalEntries={value.entries}
                    projectId={projectId}
                    automaticSummaryId={automaticStoryAnalysis
                        ?.project?.triggerAutomaticSummary?.result?.id}
                    automaticNgramsId={automaticStoryAnalysis
                        ?.project?.triggerAutomaticNgram?.result?.id}
                    onRemove={onAnalyticalEntryRemove}
                    index={index}
                    framework={framework}
                    geoAreaOptions={geoAreaOptions}
                    setGeoAreaOptions={setGeoAreaOptions}
                    onEntryDataChange={onEntryDataChange}
                />
            )}
            <DropContainer
                className={styles.dropContainer}
                name="entry"
                draggedOverClassName={styles.draggedOver}
                onDrop={handleAnalyticalEntryAdd}
            />
        </Container>
    );
}

export default genericMemo(AnalyticalStatementInput);
